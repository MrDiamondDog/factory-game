import "@canvas/renderer";

import { query, tabs } from "@util/dom";

tabs({
    buttonsContainer: query<HTMLDivElement>("#tabs"),
    tabsContainer: query<HTMLDivElement>("#content")
});
