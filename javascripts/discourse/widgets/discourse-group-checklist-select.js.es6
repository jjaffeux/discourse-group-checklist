import { h } from "virtual-dom";
import { createWidget } from "discourse/widgets/widget";
import { throttle } from "@ember/runloop";

export default createWidget("discourse-group-checklist-select", {
  tagName: "select.discourse-group-checklist-select",

  change(event) {
    const value = event.target.value;
    this.sendWidgetAction("handleUser", {
      username: this.attrs.user.username,
      value: value === "__none__" ? "" : value
    });
  },

  html() {
    const value = this.attrs.user._value;

    const defaultOption = h(
      "option",
      { attributes: { value: "__none__" } },
      I18n.t(themePrefix("select"))
    );
    return [defaultOption].concat(
      this.attrs.choices.map(choice => {
        const attributes = { value: choice };

        if (value && value === choice) {
          attributes.selected = "";
        }

        return h(
          "option",
          {
            attributes
          },
          choice
        );
      })
    );
  }
});
