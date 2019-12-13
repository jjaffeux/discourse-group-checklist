import { h } from "virtual-dom";
import { avatarImg } from "discourse/widgets/post";
import { createWidget } from "discourse/widgets/widget";
import { formatUsername } from "discourse/lib/utilities";
import hbs from "discourse/widgets/hbs-compiler";

export default createWidget("discourse-group-checklist-user", {
  tagName: "tr.discourse-group-checklist-user",

  transform(attrs) {},

  html(attrs) {
    const { name, username, avatar_template, _checked } = attrs.user;

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
        h("span.discourse-group-checklist-username", name || formatUsername(username))
      ]
    );

    const checkedButton = this.attach("button", {
      className: _checked ? "is-checked" : "",
      icon: _checked ? "check-square" : "far-square",
      action: "toggleUser",
      actionParam: attrs.user
    });

    return [
      h("td", [userNode]),
      h("td", [checkedButton]),
      h("td")
    ];
  }
});
