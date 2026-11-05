import AwsAccounts from '../components/AwsAccounts.svelte';
import Popup from '../components/Popup.svelte';
import { mount } from "svelte";

function render() {
    mount(AwsAccounts, { target: document.body });
    mount(Popup, {
            target: document.body
        });
}

document.addEventListener("DOMContentLoaded", render);
