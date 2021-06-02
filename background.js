// DOCS
// - https://developer.chrome.com/docs/extensions/reference/tabs/
// - https://developer.chrome.com/docs/extensions/reference/tabGroups/
// - https://developer.chrome.com/docs/extensions/mv3/background_pages/
// - https://developer.chrome.com/docs/extensions/reference/storage/

protected_groups = ["Base"]

chrome.tabs.onCreated.addListener((newTab) => {
    console.log("New Tab created", newTab)

    chrome.tabGroups.query({}, async (tabGroups) => {
        // Looking for opener tab.
        // we don't yet know which group the new tab belongs to, but
        // we know that it will be opened in the same group as the opener tab
        chrome.tabs.get(newTab.openerTabId, async (openerTab) => {

            // Is there a group that is protected and has the opener tab in it?
            // i.e. has the new tab been opened in a protected group?
            groups = tabGroups.filter(g => protected_groups.includes(g.title) && openerTab.groupId === g.id)

            if (groups.length == 0){
                console.log("Protected tab group not found, doing nothing")
                return
            }

            group = groups[0]

            console.log("Found protected tab group", group)

            // Move tab out of Base group
            chrome.tabs.ungroup(newTab.id)

            // Move new tab right after the protected group
            
            chrome.tabs.query({},tabs => {
                const tabsInGroup = tabs.filter(t => t.groupId == group.id).sort((a, b)=> a.index > b.index)
                const lastTab = tabsInGroup[tabsInGroup.length - 1]
                chrome.tabs.move(newTab.id, {index: lastTab.index})

            })
        })
    })
});
