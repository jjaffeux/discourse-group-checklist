import { h } from "virtual-dom";
import { avatarImg } from "discourse/widgets/post";
import { createWidget } from "discourse/widgets/widget";
import { formatUsername } from "discourse/lib/utilities";
import hbs from "discourse/widgets/hbs-compiler";

export default createWidget("discourse-group-checklist-user", {
  tagName: "tr.discourse-group-checklist-user",

  transform(attrs) {},

  buildClasses(attrs) {
    if (attrs.user._currentUser) {
      return "is-current-user";
    }
  },

  html(attrs) {
    const {
      name,
      username,
      avatar_template,
      _checked,
      _currentUser
    } = attrs.user;

    const userNode = h(
      "a",
      {
        attributes: {
          class: "discourse-group-checklist-user-avatar",
          "data-user-card": username
        }
      },
      [
        avatarImg("small", {
          template: avatar_template,
          username: name || formatUsername(username)
        }),
        h(
          "span.discourse-group-checklist-username",
          name || formatUsername(username)
        )
      ]
    );

    const classNames = [];
    if (_checked) {
      classNames.push("is-checked");
    }

    let actionComponent;
    if (this.attrs.choices.length) {
      actionComponent = this.attach("discourse-group-checklist-select", {
        user: this.attrs.user,
        choices: this.attrs.choices
      });
    } else {
      actionComponent = this.attach("button", {
        className: classNames.join(" "),
        icon: _checked ? "check-square" : "far-square",
        action: "handleUser",
        actionParam: {
          username: attrs.user.username,
          value: "✅",
          description: attrs.user._description
        }
      });
    }

    return [
      h("td.user", [userNode]),
      h("td.value", [actionComponent]),
      h("td.description", this.attrs.user._description)
    ];
  }
});
