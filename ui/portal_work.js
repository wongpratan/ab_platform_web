import ClassUI from "./ClassUI.js";
import ClassUIPage from "./ClassUIPage.js";

import PortalWorkInbox from "./portal_work_inbox.js";
import PortalWorkInboxTaskWindow from "./portal_work_inbox_taskWindow.js";
import PortalWorkUserProfileWindow from "./portal_work_user_profile_window.js";
import PortalWorkUserQRWindow from "./portal_work_user_qr_window.js";
import PortalAccessLevelManager from "./portal_access_level_manager.js";
import TranslationTool from "./portal_translation_tool.js";

class PortalWork extends ClassUI {
   constructor() {
      super();
   }

   ui() {
      return {
         id: "portal_work",
         rows: [
            {
               view: "toolbar",
               id: "mainToolbar",
               borderless: true,
               css: "webix_dark mainToolbar",
               padding: 10,
               cols: [
                  {
                     id: "portal_work_menu_sidebar",
                     view: "button",
                     type: "icon",
                     width: 50,
                     icon: "fa fa-bars no-margin",
                     click: () => {
                        let navSideBar = $$("navSidebar");
                        if (navSideBar.isVisible()) {
                           navSideBar.hide();
                        } else {
                           navSideBar.show();
                           let sidebarMenu = $$("abSidebarMenu");
                           if (sidebarMenu.getSelectedId() == "") {
                              sidebarMenu.blockEvent();
                              const firstID = sidebarMenu.getFirstId();
                              sidebarMenu.select(firstID);
                              sidebarMenu.unblockEvent();
                           }
                        }
                     },
                     on: {
                        onAfterRender() {
                           ClassUI.CYPRESS_REF(this);
                        },
                     },
                  },
                  {
                     view: "label",
                     autowidth: true,
                     id: "portal_work_menu_title",
                     label: "AppBuilder",
                     align: "left",
                     on: {
                        onAfterRender() {
                           ClassUI.CYPRESS_REF(this);
                        },
                     },
                  },
                  {},
                  {
                     id: "portal_work_menu_pages",
                     css: "appPages",
                     cols: [],
                     on: {
                        onAfterRender() {
                           ClassUI.CYPRESS_REF(this);
                        },
                     },
                  },
                  {},
                  {
                     id: "network_icon",
                     view: "button",
                     type: "icon",
                     icon: "fa fa-wifi no-margin",
                     width: 40,
                     click: () => {
                        // test out network going offline:
                        // this.AB.Network._testingHack = !this.AB.Network
                        //    ._testingHack;
                        this.AB.Network._connectionCheck();
                     },
                  },
                  {
                     id: "inbox_icon",
                     view: "button",
                     type: "icon",
                     icon: "fa fa-envelope no-margin",
                     width: 40,
                     // badge: 12,
                     click: () => {
                        PortalWorkInbox.show();
                     },
                     on: {
                        onAfterRender() {
                           ClassUI.CYPRESS_REF(this);
                        },
                     },
                  },
                  {
                     id: "settings_icon",
                     view: "button",
                     type: "icon",
                     icon: "fa fa-cog fa-lg no-margin",
                     width: 40,
                     hidden: true,
                     popup: "settingsMenu",
                     /* Look at this.refreshSettingsMenu() for menu options and actions */
                     on: {
                        onAfterRender() {
                           ClassUI.CYPRESS_REF(this);
                        },
                     },
                  },
                  {
                     id: "user_icon",
                     view: "button",
                     type: "icon",
                     icon: "fa fa-user-circle no-margin",
                     width: 40,
                     popup: "userMenu",
                     /* Look at Popup created below for menu options and actions */
                     on: {
                        onAfterRender() {
                           ClassUI.CYPRESS_REF(this);
                        },
                     },
                  },
               ],
            },
            {
               cols: [
                  {
                     id: "navSidebar",
                     hidden: true,
                     autoheight: true,
                     borderless: true,
                     rows: [
                        {
                           id: "abNavSidebarScrollView",
                           view: "scrollview",
                           scroll: "y",
                           css: "darkScrollview",
                           body: {
                              rows: [
                                 {
                                    view: "sidebar",
                                    id: "abSidebarMenu",
                                    borderless: true,
                                    css: "webix_dark mainSidebar",
                                    data: [],
                                    on: {
                                       onAfterRender() {
                                          this.data.each((a) => {
                                             ClassUI.CYPRESS_REF(
                                                this.getItemNode(a.id),
                                                a.id
                                             );
                                          });
                                       },
                                       onAfterSelect: (/* id */) => {
                                          // this.selectApplication(id);
                                       },
                                       onItemClick: (id) => {
                                          this.selectApplication(id);
                                       },
                                    },
                                 },
                              ],
                           },
                        },
                        {
                           view: "template",
                           borderless: true,
                           css: "appDevDesigns",
                           height: 110,
                        },
                     ],
                  },
                  {
                     id: "abWorkPages",
                     template: "No Applications Have Been Loaded.",
                  }, // this is where content goes
               ],
            },
         ],
      };
   }

   async init(AB) {
      this.AB = AB;

      this.storageKey = "portal_work_state";

      this.pageContainers = {};

      const L = (...params) => {
         return this.label(...params);
      };

      const allInits = [];

      allInits.push(PortalWorkUserProfileWindow.init(this.AB));

      // {hash}  { ABViewPage.id : ClassUIPage() }
      // track each of the page containers (instances of ClassUIPage) that
      // are responsible for displaying the proper state of each of our
      // Root Pages.

      // Get all our ABApplications and loaded Plugins in allApplications
      const allApplications = (this.AB.applications() || []).concat(
         this.AB.plugins() || []
      );

      // Build out our Navigation Side Bar Menu with our available
      // ABApplications
      const menu_data = [];

      for (let i = 0; i < allApplications.length; i++) {
         // TODO: implement Sorting on these before building UI
         menu_data.push(this.uiSideBarMenuEntry(allApplications[i]));
      }

      $$("abSidebarMenu").define("data", menu_data);
      this.sidebarResize();

      const userMenuOptions = [
         { id: "user_profile", label: L("User Profile"), icon: "user" },
         {
            id: "user_switcheroo",
            label: L("Switcheroo"),
            icon: "user-secret",
         },
         { id: "user_logout", label: L("Logout"), icon: "ban" },
      ];

      // Only add the QR Code option if the relay service is enabled
      const { relay } = this.AB.Config.siteConfig();

      if (relay) {
         // Insert at userMenuOptions[2] so logout is still last
         userMenuOptions.splice(2, 0, {
            id: "user_qr",
            label: L("Connect Mobile App"),
            icon: "qrcode",
         });
      }

      // This is the User popup menu that opens when you click the user icon in the main nav
      webix.ui({
         view: "popup",
         id: "userMenu",
         width: 150,
         body: {
            view: "list",
            data: userMenuOptions,
            template: "<i class='fa-fw fa fa-#icon#'></i> #label#",
            autoheight: true,
            select: true,
            on: {
               onItemClick: (id) => {
                  switch (id) {
                     case "user_profile":
                        PortalWorkUserProfileWindow.show();
                        break;
                     case "user_logout":
                        AB.Account.logout();
                        break;
                     case "user_qr":
                        PortalWorkUserQRWindow.init(AB);
                        PortalWorkUserQRWindow.show();
                        break;
                     default:
                        //eslint-disable-next-line
                        const item = userMenuOptions.filter(
                           (o) => o.id == id
                        )[0];
                        webix.message(
                           `<b>Not yet implemented</b><br/>
                           Menu item:<i>${item.label}</i><br/>
                           Menu ID:<i>${item.id}</i>`
                        );
                  }
                  $$("userMenu").hide();
               },

               onAfterRender() {
                  this.data.each((a) => {
                     ClassUI.CYPRESS_REF(this.getItemNode(a.id), a.id);
                  });
               },
            },
         },
      });

      // Now Fill out Toolbar and Root Pages:
      //
      // Step 1: prepare the AppState so we can determine which options
      // should be pre selected.
      //
      const AppState = (await this.AB.Storage.get(this.storageKey)) ?? {
         lastSelectedApp: null,
         // {string}  the ABApplication.id of the last App selected

         lastPages: {},
         // {hash}  { ABApplication.id : ABPage.id }
         // a lookup of all the last selected Pages for each Application
      };

      this.AppState = AppState;

      // set default selected App if not already set
      // just choose the 1st App in the list (must have pages that we have
      // access to)
      if (!this.AppState.lastSelectedApp && menu_data.length)
         for (let i = 0; i < menu_data.length; i++)
            if (
               (
                  menu_data[i].abApplication
                     .pages()
                     .filter((p) => p.getUserAccess?.() > 0) || []
               ).length > 0
            ) {
               this.AppState.lastSelectedApp = menu_data[i].abApplication.id;

               break;
            }

      //
      // Step 2: figure out the Default Page to be displayed.
      //
      let DefaultPage = null;
      // {ABViewPage}
      // The ABViewPage of the 1st page to display.

      // sidebar and NavBar are already built at this point. So we can
      // query them.
      const $sideBar = $$("abSidebarMenu");

      if ($sideBar) {
         // search the Menu entries to see which one matches our
         // stored AppState
         let foundMenuEntry = this.sidebarMenuEntryByID(
            this.AppState.lastSelectedApp
         );

         if (!foundMenuEntry) {
            // if we couldn't find the entry then our .lastSelectedApp
            // must be referencing an Application we no longer have
            // access to.
            // So just pick the 1st app with pages
            for (let i = 0; i < menu_data.length; i++) {
               if ((menu_data[i].abApplication.pages() || []).length > 0) {
                  foundMenuEntry =
                     this.sidebarMenuEntryByID(menu_data[i].abApplication.id) ||
                     null;

                  if (foundMenuEntry) break;
               }
            }
         }

         if (foundMenuEntry) {
            $sideBar.select(foundMenuEntry.id);
            this.selectApplication(foundMenuEntry.id);

            const defaultPageID =
               this.AppState.lastPages[foundMenuEntry.abApplication.id];

            DefaultPage = foundMenuEntry.abApplication.pages(
               (p) => p.id === defaultPageID
            )[0];

            if (!DefaultPage) {
               // then just pick the first one:
               DefaultPage = foundMenuEntry.abApplication.pages()[0];
            }
         }
      }

      //
      // Step 3: Prime the content area with placeholders for ALL
      // Root Pages
      //
      const allPlaceholders = [];

      for (let i = 0; i < allApplications.length; i++) {
         const pages = allApplications[i].pages() || [];

         for (let j = 0; j < pages.length; j++) {
            if (pages[j].getUserAccess?.() === 0) continue;

            allPlaceholders.push({
               id: this.pageID(pages[j]),
               template: `Page: ${pages[j].label || pages[j].name}`,
            });
         }
      }

      if (allPlaceholders.length > 0)
         webix.ui(
            {
               view: "multiview",
               keepViews: true,
               animate: false,
               cells: allPlaceholders,
            },
            $$("abWorkPages")
         );

      //
      // Step 4: initialize the DefaultPage
      // when it is finished we can show that page and emit "ready" to
      // signal we can transition to the Work Portal
      //
      if (!this.App) {
         // page.component() require a common {ABComponent.App}
         this.App = new this.AB.Class.ABComponent(
            null,
            "portal_work",
            this.AB
         ).App;
      }

      if (DefaultPage) {
         const container = new ClassUIPage(
            this.pageID(DefaultPage),
            DefaultPage,
            this.App,
            this.AB
         );
         const containerInit = async () => {
            await container.init(this.AB, true);
            this.showPage(DefaultPage);
         };

         this.pageContainers[DefaultPage.id] = container;
         allInits.push(containerInit());
      }
      // let pUI = DefaultPage.component(this.App);

      // webix.ui(pUI.ui, $$(this.pageID(DefaultPage)));
      // pUI.init();
      // pUI.onShow();
      // this.showPage(DefaultPage);

      //
      // Step 5: initialize the remaining Pages
      //
      for (let i = 0; i < allApplications.length; i++) {
         const pages = allApplications[i].pages() || [];

         for (let j = 0; j < pages.length; j++) {
            if (pages[j].getUserAccess?.() === 0) continue;

            if (!DefaultPage || pages[j].id !== DefaultPage.id) {
               const cont = new ClassUIPage(
                  this.pageID(pages[j]),
                  pages[j],
                  this.App,
                  this.AB
               );

               this.pageContainers[pages[j].id] = cont;

               allInits.push(cont.init(this.AB));

               // let comp = page.component(commonComp.App);
               // webix.ui(comp.ui, $$(this.pageID(page)));
               // comp.init();
               // comp.onShow();
            }
         }
      }

      this.refreshSettingsMenu();
      //
      // Step 6: Initialize the Inbox Items
      //
      PortalWorkInbox.on("updated", () => {
         const count = PortalWorkInbox.count();
         $$("inbox_icon").define({ badge: count ? count : false });
         $$("inbox_icon").refresh();
      });

      await PortalWorkInbox.init(this.AB);

      //
      // Step 7: As well as the Inbox Task Window
      //
      allInits.push(PortalWorkInboxTaskWindow.init(this.AB));

      // Network and Queued operations Alert
      $$("network_icon").hide();
      this.AB.Network.on("queued", () => {
         const count = this.AB.Network.queueCount();
         $$("network_icon").define({ badge: count ? count : false });
         $$("network_icon").refresh();
         if (count > 0) {
            $$("network_icon").show();
         } else {
            $$("network_icon").hide();
         }
      });

      this.AB.Network.on("queue.synced", () => {
         $$("network_icon").define({ badge: false });
         $$("network_icon").refresh();
         $$("network_icon").hide();
      });

      this.emit("ready");

      // !!! HACK: Leave this for James to figure out why Menu Title isn't proper
      // size on initial loading.
      setTimeout(() => {
         $$("portal_work_menu_title").resize();
      }, 200);

      // Now attempt to flush any pending network operations:
      this.AB.Network._connectionCheck();

      // Be sure our UI elements that don't respond to onAfterRender()
      // have their cypress references set:
      ["portal_work_menu_pages"].forEach((eid) => {
         ClassUI.CYPRESS_REF($$(eid));
      });

      await Promise.all(allInits);
   }

   /**
    * pageID()
    * return a commone webix.id for a given ABViewPage
    * @param {ABViewPage || string} page
    *       An instance of ABViewPage, OR a string of the ABViewPage.id
    * @return {string}
    */
   pageID(page) {
      return `page_${page.id || page}`;
   }

   selectApplication(id) {
      const row = $$("abSidebarMenu").getItem(id);

      const pageButtons = [];
      // {array}
      // the webix menu buttons for each Page

      let firstPage = true;
      // {bool} firstPage
      // should we choose the 1st page as being the active page?

      let activePageID = null;
      // {string}
      // The ABViewPage.id of the active Page for the current Application.
      if (this.AppState.lastSelectedApp != row.abApplication.id) {
         // remember the current Application has been selected
         this.AppState.lastSelectedApp = row.abApplication.id;
         this.saveState();
         // Need to Settings Menu if different for each app
         this.refreshSettingsMenu();
      }

      // if the current Application already has an Active State Page marked
      // we don't want the first page:
      activePageID = this.AppState.lastPages[row.abApplication.id];
      if (activePageID) {
         firstPage = false;
      }

      // Build a Menu Button for each of the ABApplication Root Pages
      (row.abApplication.pages() || []).forEach((p) => {
         if (p.getUserAccess?.() == 0) return;
         // Decide if current Page button should look selected.
         let active = "";
         if (firstPage || p.id == activePageID) {
            active = "activePage";
            firstPage = false;

            // remember this one
            this.AppState.lastPages[row.abApplication.id] = p.id;
         }

         let pbLabel = p.label;
         if ("function" === typeof p.label) {
            pbLabel = p.label();
         }
         pageButtons.push({
            view: "button",
            css: active,
            type: "icon",
            label: pbLabel,
            autowidth: true,
            icon: `fa fa-${p.icon}`,
            abPage: p,
            click: (item) => {
               // when button is clicked, update the selected look
               const pageButton = $$(item);

               // Remove any other "activePage" entries
               $$("portal_work_menu_pages")
                  .queryView(
                     {
                        css: "activePage",
                     },
                     "all"
                  )
                  .forEach((p) => {
                     if (p != pageButton) {
                        p.define("css", "");
                        p.$view.classList.remove("activePage");
                     }
                  });

               // make sure this one is marked
               pageButton.define("css", "activePage");
               pageButton.$view.classList.add("activePage");

               // now trigger the page to display:
               this.showPage(pageButton.data.abPage);
            },
            on: {
               onAfterRender() {
                  ClassUI.CYPRESS_REF(this, p.id);
               },
            },
         });
      });
      webix.ui(pageButtons, $$("portal_work_menu_pages"));

      $$("portal_work_menu_title").setValue(row.value);
      $$("portal_work_menu_title").resize();

      // now everything is displayed
      // default initial display to current activePage:
      let selectedPage = null;
      $$("portal_work_menu_pages")
         .queryView(
            {
               css: "activePage",
            },
            "all"
         )
         .forEach((p) => {
            selectedPage = p;
         });
      this.showPage(selectedPage?.data?.abPage);

      // hide the sidebar menu
      const sideBar = $$("navSidebar");
      if (sideBar.isVisible()) {
         sideBar.hide();
      }
   }

   /**
    * saveState()
    * trigger a save of our current AppState.
    * NOTE: we delay this so we can catch multiple saves in a short period
    * of time.
    */
   saveState() {
      if (this._saveTimeoutID) {
         clearTimeout(this._saveTimeoutID);
      }
      this._saveTimeoutID = setTimeout(() => {
         this.AB.Storage.set(this.storageKey, this.AppState);
      }, 500);
   }

   show() {
      $$("portal_work").show();
   }

   showPage(page) {
      // this could be a subpage
      const pageUI = this.pageContainers[page?.id];

      if (pageUI) {
         pageUI.show();
         this.AppState.lastPages[page.application.id] = page.id;
         this.saveState();
      }
   }

   /**
    * @method sidebarMenuEntryByID()
    * returns the sidebar menu entry that matches the given {menuID}
    * @param {string|uuid} menuID
    * @return {obj}
    */
   sidebarMenuEntryByID(menuID) {
      const $sideBar = $$("abSidebarMenu");

      let foundMenuEntry = null;

      if ($sideBar) {
         // search the Menu entries to see which one matches our
         // stored AppState

         let id = $sideBar.getFirstId();
         while (!foundMenuEntry && id) {
            let entry = $sideBar.getItem(id);
            if (entry.abApplication.id == menuID) {
               foundMenuEntry = entry;
            }
            id = $sideBar.getNextId(id);
         }
      }

      return foundMenuEntry;
   }

   sidebarResize() {
      const sidebarMenu = $$("abSidebarMenu");
      const sideBarHeight = sidebarMenu.count() * 45 + 1;

      sidebarMenu.define("height", sideBarHeight);
      sidebarMenu.resize();
      // $$("abNavSidebarScrollView").resize(true);
   }

   /**
    * generate the Webix definition for a menu entry given the ABApplication
    * the menu entry should represent.
    * @param {ABApplication} app
    * @return {obj} Webix.ui definition.
    */
   uiSideBarMenuEntry(app) {
      return {
         id: app.id,
         icon: `fa ${app.icon}`,
         value: app.label || app.name,
         abApplication: app,
         // This is never called:
         // on: {
         //    onAfterRender() {
         //       debugger;
         //       ClassUI.CYPRESS_REF(this, app.id);
         //    },
         // },
      };
   }

   refreshSettingsMenu() {
      const { uuid, roles } = this.AB.Config.userConfig();
      const application = this.AB.applicationByID(
         this.AppState.lastSelectedApp
      );
      const settingsMenuOptions = [];

      if (!application) return $$("settings_icon").hide();
      if (application.isAccessManaged) {
         let isManager = false;
         if (
            application.accessManagers.useAccount == "1" &&
            application.accessManagers.account.indexOf(uuid) > -1
         ) {
            isManager = true;
         }
         if (!isManager && application.accessManagers.useRole == "1") {
            roles.forEach((role) => {
               if (application.accessManagers.role.indexOf(role.uuid) > -1) {
                  isManager = true;
               }
            });
         }
         if (isManager) {
            settingsMenuOptions.push({
               id: "accessLevel",
               label: this.label("Access Manager"),
               icon: "lock",
            });
         }
      }
      if (application.isTranslationManaged) {
         let isManager = false;
         if (
            application.translationManagers.useAccount == "1" &&
            application.translationManagers.account.indexOf(uuid) > -1
         ) {
            isManager = true;
         }
         if (!isManager && application.translationManagers.useRole == "1") {
            roles.forEach((role) => {
               if (
                  application.translationManagers.role.indexOf(role.uuid) > -1
               ) {
                  isManager = true;
               }
            });
         }
         if (isManager) {
            settingsMenuOptions.push({
               id: "translation",
               label: this.label("Translation Tool"),
               icon: "language",
            });
         }
      }

      if (settingsMenuOptions.length < 1) return $$("settings_icon").hide();

      $$("settings_icon").show();

      webix.ui({
         view: "popup",
         id: "settingsMenu",
         width: 150,
         body: {
            view: "list",
            data: settingsMenuOptions,
            template: "<i class='fa-fw fa fa-#icon#'></i> #label#",
            autoheight: true,
            select: true,
            on: {
               onItemClick: (id /*, event */) => {
                  switch (id) {
                     case "accessLevel":
                        PortalAccessLevelManager.init(this);
                        PortalAccessLevelManager.show();
                        break;
                     case "translation":
                        TranslationTool.init(this);
                        TranslationTool.show();
                        break;
                     default:
                        //eslint-disable-next-line
                        const item = settingsMenuOptions.filter(
                           (o) => o.id == id
                        )[0];
                        webix.message(
                           `<b>Not yet implemented</b><br/>
                           Menu item:<i>${item.label}</i><br/>
                           Menu ID:<i>${item.id}</i>`
                        );
                  }
                  $$("userMenu").hide();
               },

               onAfterRender() {
                  this.data.each((a) => {
                     ClassUI.CYPRESS_REF(this.getItemNode(a.id), a.id);
                  });
               },
            },
         },
      });
   }
}

export default new PortalWork();
