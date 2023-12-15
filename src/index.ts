import "@canvas/renderer";

import { query, tabs } from "@util/dom";

tabs({
    buttonsContainer: query<HTMLDivElement>("#tabs"),
    tabsContainer: query<HTMLDivElement>("#content")
});

tabs({
    buttonsContainer: query<HTMLDivElement>("#sidebar-tabs"),
    tabsContainer: query<HTMLDivElement>("#sidebar-tabs-content")
});
