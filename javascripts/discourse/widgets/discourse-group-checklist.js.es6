import { ajax } from "discourse/lib/ajax";
import { cookAsync } from "discourse/lib/text";
import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-group-checklist", {
  tagName: "div.discourse-group-checklist",

  buildKey: attrs => `discourse-group-checklist-${attrs.id}`,

  transform(attrs) {
    const users = attrs.members
      .map(member => {
        member._checked = attrs.checkedUsers.includes(member.username);
        member._currentUser = attrs.currentUsername === member.username;
        return member;
      })
      .filter(member => {
        if (this.state.filter) {
          const filter = this.state.filter.toLowerCase();
          if (
            member.username.toLowerCase().indexOf(filter) > -1 ||
            (member.name && member.name.toLowerCase().indexOf(filter) > -1)
          ) {
            return true;
          }
        } else {
          return true;
        }
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a._currentUser) return -10;
        if (b._currentUser) return 1;
        if (a._checked && !b._checked) return 1;
        if (!a._checked && b._checked) return -1;

        return 0;
      });

    return { users };
  },

  defaultState(attrs) {
    return { filter: null, isLoading: false };
  },

  onChangeFilter(filter) {
    this.state.filter = filter && filter.length ? filter : null;
  },

  toggleUser(user) {
    const post = this.attrs.post;

    if (!post) {
      return;
    }

    if (!post.can_edit) {
      return;
    }

    this.state.isLoading = true;

    if (this.attrs.checkedUsers.includes(user.username)) {
      this.attrs.checkedUsers.removeObject(user.username);
    } else {
      this.attrs.checkedUsers.pushObject(user.username);
    }

    ajax(`/posts/${post.id}`, { type: "GET", cache: false })
      .then(result => {
        const regex = new RegExp(
          `(.*\\[wrap=group\\-checklist.*?identifier=${
            this.attrs.identifier
          }.*?\\])(.*?)(\\[\\/wrap\\].*)`,
          "gmsi"
        );

        const newRaw = result.raw.replace(
          regex,
          (match, before, capture, after) => {
            return `${before}\n${this.attrs.checkedUsers.join("\n")}\n${after}`;
          }
        );

        return cookAsync(newRaw).then(cooked =>
          post.save({
            cooked: cooked.string,
            raw: newRaw,
            edit_reason: I18n.t(themePrefix("edit_reason"))
          })
        );
      })
      .finally(() => (this.state.isLoading = false));
  },

  template: hbs`
    {{#if this.state.isLoading}}
      <div class='spinner'></div>
    {{else}}
      <table>
        <thead>
          <tr>
            <th>
              <h3 class="discourse-group-checklist-title">
                {{#if this.attrs.title}}
                  <span>{{attrs.title}}</span>
                {{/if}}
                <span>{{attrs.checkedUsers.length}}/{{transformed.users.length}}</span>
              </h3>
            </th>
            <th></th>
            <th>
              {{attach widget="discourse-group-checklist-filter"}}
            </th>
          </tr>
        </thead>
        <tbody>
          {{#each transformed.users as |user|}}
            {{attach
              widget="discourse-group-checklist-user"
              attrs=(hash
                user=user
              )
            }}
          {{/each}}
        </tbody>
      </table>
    {{/if}}
  `
});
