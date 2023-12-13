import { query, tabs } from "@util/dom";
import "@canvas/renderer";
import "@objects/index";

tabs({
    buttonsContainer: query<HTMLDivElement>("#tabs"),
    tabsContainer: query<HTMLDivElement>("#content")
});

tabs({
    buttonsContainer: query<HTMLDivElement>("#sidebar-tabs"),
    tabsContainer: query<HTMLDivElement>("#sidebar-tabs-content")
});