import NewTab from "../components/NewTab.svelte";
import { storage } from "../storage";

import "./styles.css";
import { mount } from "svelte";

function render() {
    const target = document.getElementById("app");

    if (target) {
        mount(NewTab, {
            target,
        });
    }
}

document.addEventListener("DOMContentLoaded", render);
