<script lang="ts">
    // copied from https://svelte.dev/repl/d65a4e9f0ae74d1eb1b08d13e428af32?version=3.35.0

    // based on suggestions from:
    // Inclusive Components by Heydon Pickering https://inclusive-components.design/toggle-button/
    // On Designing and Building Toggle Switches by Sara Soueidan https://www.sarasoueidan.com/blog/toggle-switch-design/


    type Props = {
        // and this example by Scott O'hara https://codepen.io/scottohara/pen/zLZwNv
        label?: string;
        id?: string;
        checked: boolean;
        onChange?: () => void;
    };

    let {
        label = '',
        id = '',
        checked = $bindable(),
        onChange = () => {}
    }: Props = $props();

    let clicked = $state(false);

    let switchId = id || label;

    function onClick() {
        checked = !checked;
        clicked = true;
        onChange();
    }
</script>

<div class="switch">
    {#if label?.length}
        <label for={switchId}>{label}:</label>
    {/if}
    <button
            id={switchId}
            name={switchId}
            role="switch"
            aria-label="switch"
            class:animate={clicked}
            aria-checked={checked}
            onclick={onClick}>
    </button>
</div>

<style lang="scss">
    @use '../assets/colors' as *;

    .switch {
        display: flex;
        align-items: center;
        margin-right: 10px;
        flex-grow: 1;

        button, label {
            cursor: pointer;
        }

        button {
            width: 3em;
            height: 1.6em;
            position: relative;
            margin: 0 0 0 0.5em;
            background-color: $kh-light;
            border: none;
            border-radius: 1.5em;

            &.animate {
                transition: background-color 0.3s;
                &:before {
                    transition: transform 0.3s;
                }
            }

            &[aria-checked='true'] {
                background-color: $kh-green;

                &:before {
                    transform: translateX(1.3em);
                }
            }

            &:focus {
                border-radius: 1.5em;
            }

            &:before {
                content: '';
                position: absolute;
                width: 1.3em;
                height: 1.3em;
                background-color: #fff;
                top: 0.13em;
                right: 1.5em;
                //transition: transform 0.3s;
                border-radius: 100%;
            }
        }
    }
</style>
