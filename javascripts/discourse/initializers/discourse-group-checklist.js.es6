import { escapeExpression } from "discourse/lib/utilities";
import WidgetGlue from "discourse/widgets/glue";
import { getRegister } from "discourse-common/lib/get-owner";
import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default {
  name: "discourse-group-timezones",

  initialize() {
    withPluginApi("0.8.7", api => {
      let _glued = [];

      function cleanUp() {
        _glued.forEach(g => g.cleanUp());
        _glued = [];
      }

      function _attachWidget(api, container, options) {
        const glue = new WidgetGlue(
          "discourse-group-checklist",
          getRegister(api),
          options
        );
        glue.appendTo(container);
        _glued.push(glue);
      }

      function _loadGroupMembers(group) {
        return ajax(`/groups/${group}/members.json?limit=50`, {
          type: "GET",
          cache: false
        })
          .then(groupResult => {
            if (groupResult && groupResult.members) {
              return groupResult.members;
            }
          })
          .catch(popupAjaxError);
      }

      function _attachGroupChecklists($elem, post) {
        const $groupChecklists = $(".d-wrap[data-wrap=group-checklist]", $elem);

        const id = post ? post.id : 1;

        if (!$groupChecklists.length) {
          return;
        }


        $groupChecklists.each((idx, groupChecklist) => {
          const checkedUsers = [];
          groupChecklist.querySelectorAll("tbody tr").forEach(tr => {
            const checkedUser = {};
            tr.querySelectorAll("td").forEach((td, index) => {
              switch (index) {
                case 0:
                  checkedUser.username = td.innerText.trim();
                  break;
                case 1:
                  checkedUser.value = td.innerText.trim();
                  break;
                case 2:
                  checkedUser.description = td.innerText.trim();
                  break;
              }
            });
            checkedUsers.push(checkedUser);
          });

          const identifier = escapeExpression(
            groupChecklist.getAttribute("data-identifier")
          );
          if (!identifier) {
            console.error("[identifier] attribute is mandatory.");
            return;
          }

          const identifiers = $elem[0].querySelectorAll(`.d-wrap[data-wrap=group-checklist][data-identifier=${identifier}]`);
          if (identifiers && identifiers.length > 1) {
            console.error("[identifier] should be unique.");
            return;
          }

          const group = escapeExpression(
            groupChecklist.getAttribute("data-group")
          );
          if (!group) {
            console.error("[group] attribute is mandatory.");
            return;
          }

          const title = escapeExpression(
            groupChecklist.getAttribute("data-title")
          );

          const choices = (groupChecklist.getAttribute("data-choices") || "")
            .split(",")
            .filter(Boolean)
            .map(choice => escapeExpression(choice));

          groupChecklist.innerHTML = "<div class='spinner'></div>";

          _loadGroupMembers(group).then(members => {
            _attachWidget(api, groupChecklist, {
              id: `${id}-${idx}-${identifier}`,
              identifier,
              post,
              checkedUsers,
              members: JSON.parse(JSON.stringify(members)),
              title,
              currentUsername: api.getCurrentUser().get("username"),
              choices
            });
          });
        });
      }

      function _attachPostWithGroupChecklists($elem, helper) {
        if (helper) {
          const post = helper.getModel();
          api.preventCloak(post.id);
          _attachGroupChecklists($elem, post);
        }
      }

      api.decorateCooked(_attachPostWithGroupChecklists, {
        id: "discourse-group-checklist"
      });

      api.cleanupStream(cleanUp);
    });
  }
};
