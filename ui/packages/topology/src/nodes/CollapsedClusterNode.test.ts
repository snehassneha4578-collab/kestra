import {describe, expect, it} from "vitest"
import {Position} from "@vue-flow/core"
import CollapsedClusterNode from "./CollapsedClusterNode.vue"
import {CLUSTER_TAG_STATUS, EVENTS} from "../utils/constants"
import {i18nMount} from "../../../../tests/unit/i18nMount"

function mountCollapsedClusterNode({
    id = "root.parallel.my-cluster",
    color = "triggers",
    expandable,
}: {
    id?: string;
    color?: string;
    expandable?: boolean;
} = {}) {
    return i18nMount(CollapsedClusterNode, {
        props: {
            id,
            sourcePosition: Position.Left,
            targetPosition: Position.Right,
            data: {color, expandable},
        },
        global: {
            stubs: {
                Handle: {
                    props: ["type", "position"],
                    template:
                        "<span class='handle-stub' :data-type='type' :data-position='position' />",
                },
                LaneHeader: true,
                KsTooltip: {template: "<span><slot /></span>"},
                UnfoldMoreHorizontal: true,
            },
        },
    })
}

describe("CollapsedClusterNode badge", () => {
    it("should display the ID segment after the last dot", () => {
        const wrapper = mountCollapsedClusterNode({
            id: "root.parallel.my-cluster",
        })

        expect(wrapper.find(".cluster-badge").text()).toBe("my-cluster")
    })

    it.each(Object.entries(CLUSTER_TAG_STATUS))(
        "should map the known colour '%s' to status '%s'",
        (color, status) => {
            const wrapper = mountCollapsedClusterNode({color})
            const style = wrapper.find(".cluster-badge").attributes("style")

            expect(style).toContain(`var(--ks-status-${status})`)
        },
    )

    it("should use the info status for an unknown colour", () => {
        const wrapper = mountCollapsedClusterNode({color: "unknown-colour"})
        const style = wrapper.find(".cluster-badge").attributes("style")

        expect(style).toContain("var(--ks-status-info)")
    })
})

describe("CollapsedClusterNode expand control", () => {
    it("should show the expand button when expandable is true", () => {
        const wrapper = mountCollapsedClusterNode({expandable: true})

        expect(wrapper.find(".circle-button").exists()).toBe(true)
    })

    it("should not show the expand button when expandable is false", () => {
        const wrapper = mountCollapsedClusterNode({expandable: false})

        expect(wrapper.find(".circle-button").exists()).toBe(false)
    })

    it("should not show the expand button when expandable is absent", () => {
        const wrapper = mountCollapsedClusterNode()

        expect(wrapper.find(".circle-button").exists()).toBe(false)
    })

    it("should emit the expand event with the node ID when clicked", async () => {
        const id = "root.parallel.my-cluster"
        const wrapper = mountCollapsedClusterNode({id, expandable: true})

        await wrapper.find(".circle-button").trigger("click")

        expect(wrapper.emitted(EVENTS.EXPAND)).toEqual([[{id}]])
    })
})

describe("CollapsedClusterNode Vue Flow handles", () => {
    it("should render source and target handles", () => {
        const wrapper = mountCollapsedClusterNode()

        const handles = wrapper.findAll(".handle-stub")

        expect(handles).toHaveLength(2)
        expect(handles.map((handle) => handle.attributes("data-type"))).toEqual(
            ["source", "target"],
        )
    })
})
