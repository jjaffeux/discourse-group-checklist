import { createWidget } from "discourse/widgets/widget";
import { throttle } from "@ember/runloop";

export default createWidget("discourse-group-checklist-filter", {
  tagName: "input.discourse-group-checklist-filter",

  input(event) {
    this.changeFilterThrottler(event.target.value);
  },

  changeFilterThrottler(filter) {
    throttle(this, function() {
      this.sendWidgetAction("onChangeFilter", filter);
    }, 100);
  },

  buildAttributes(attrs) {
    return {
      type: "text",
      placeholder: I18n.t(themePrefix("search"))
    };
  }
});
