<template>
  <SvComponent
    :is="'survey-string'"
    v-if="element.isTitleRenderedAsString"
    :locString="element.locRenderedTitle"
  />
  <span
    v-if="!element.isTitleRenderedAsString && element.isRequireTextOnStart"
    :class="element.cssRequiredMark"
    :aria-hidden="true"
    >{{ element.requiredMark }}</span
  >
  <span v-if="!element.isTitleRenderedAsString && element.isRequireTextOnStart">&nbsp;</span>
  <span
    v-if="!element.isTitleRenderedAsString && element.no"
    style="position: static"
    :class="element.cssTitleNumber"
    :aria-hidden="true"
    >{{ element.no }}</span
  >
  <span v-if="!element.isTitleRenderedAsString && element.no">&nbsp;</span>
  <span
    v-if="!element.isTitleRenderedAsString && element.isRequireTextBeforeTitle"
    :class="element.cssRequiredMark"
    :aria-hidden="true"
    >{{ element.requiredMark }}</span
  >
  <span
    v-if="!element.isTitleRenderedAsString && element.isRequireTextBeforeTitle"
    >&nbsp;</span
  >
  <SvComponent
    :is="'survey-string'"
    v-if="!element.isTitleRenderedAsString"
    :locString="element.locRenderedTitle"
  />
  <span
    v-if="!element.isTitleRenderedAsString && element.isRequireTextAfterTitle"
    >&nbsp;</span
  >
  <span
    v-if="!element.isTitleRenderedAsString && element.isRequireTextAfterTitle"
    :class="element.cssRequiredMark"
    :aria-hidden="true"
    >{{ element.requiredMark }}</span
  >
</template>

<script lang="ts" setup>
import SvComponent from "@/SvComponent.vue";
import type { PanelModel, Question } from "survey-core";

defineOptions({ inheritAttrs: false });
defineProps<{
  element: Question | PanelModel;
  css: any;
}>();
</script>
