<template>
  <div :class="question.cssClasses.hint">
    <div v-if="model.showHintPrefix" :class="question.cssClasses.hintPrefix">
      <span>{{ model.hintStringPrefix }}</span>
    </div>

    <div :class="question.cssClasses.hintSuffixWrapper">
      <SvComponent
        :is="'survey-string'"
        v-if="question.showSelectedItemLocText"
        :locString="question.selectedItemLocText"
      />
      <div v-if="model.showHintString" :class="question.cssClasses.hintSuffix">
        <span style="visibility: hidden">{{ model.inputStringRendered }}</span>
        <span>{{ model.hintStringSuffix }}</span>
      </div>
      <input
        type="text"
        autocomplete="off"
        v-model="renderedValue"
        :class="question.cssClasses.filterStringInput"
        :placeholder="model.filterStringPlaceholder"
        :disabled="question.isDisabledAttr"
        :inputmode="model.inputMode"
        :role="model.ariaInputRole"
        :aria-required="model.ariaInputRequired"
        :aria-invalid="model.ariaInputInvalid"
        :aria-errormessage="model.ariaInputErrorMessage"
        :aria-expanded="model.ariaInputExpanded"
        :aria-label="model.ariaInputLabel"
        :aria-labelledby="model.ariaInputLabelledby"
        :aria-describedby="model.ariaInputDescribedby"
        :aria-controls="model.ariaInputControls"
        :aria-activedescendant="model.ariaInputActivedescendant"
        :id="question.getInputId()"
        :readonly="model.filterReadOnly ? true : undefined"
        :size="!model.inputStringRendered ? 1 : undefined"
        @change="inputChange"
        @keydown="inputKeyHandler"
        @blur="blur"
        @focus="focus"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import SvComponent from "@/SvComponent.vue";
import { useBase } from "@/base";
import type {
  DropdownMultiSelectListModel,
  QuestionTagboxModel,
} from "survey-core";
import { computed } from "vue";

const props = defineProps<{
  question: QuestionTagboxModel;
  model: DropdownMultiSelectListModel;
}>();
const inputChange = (event: any) => {
  const model = props.model;
  model.inputStringRendered = event.target.value;
};
const inputKeyHandler = (event: any) => {
  props.model.inputKeyHandler(event);
};
const blur = (event: any) => {
  props.question.onBlur(event);
};
const focus = (event: any) => {
  props.question.onFocus(event);
};
const renderedValue = computed({
  get() {
    return props.model.inputStringRendered ?? "";
  },
  set(val) {
    const model = props.model;
    model.inputStringRendered = val;
  },
});

useBase(() => props.model);
</script>
