<template>
  <div :class="question.cssClasses.root" v-on:keydown="question.onKeyDownCore($event)">
    <label :class="question.getItemCss()">
      <input
        type="checkbox"
        :name="question.name"
        :value="question.booleanValue"
        v-model="question.booleanValue"
        :class="question.cssClasses.control"
        :id="question.inputId"
        :indeterminate.prop="question.isIndeterminate"
        :disabled="question.isDisabledAttr"
        :readonly="question.isReadOnlyAttr"
        :role="question.a11y_input_ariaRole"
        :aria-required="question.a11y_input_ariaRequired"
        :aria-label="question.a11y_input_ariaLabel"
        :aria-labelledby="question.a11y_input_ariaLabelledBy"
        :aria-describedby="question.a11y_input_ariaDescribedBy"
        :aria-invalid="question.a11y_input_ariaInvalid"
        :aria-errormessage="question.a11y_input_ariaErrormessage"
      />
      <div
        :class="question.cssClasses.sliderGhost"
        v-on:click="onLabelClick($event, question.swapOrder)"
      >
      <span
        :class="question.getLabelCss(question.swapOrder)"
        ><survey-string :locString="question.locLabelLeft"></survey-string
      ></span>
      </div>
      <div
        :class="question.cssClasses.switch"
        v-on:click="onSwitchClick($event)"
      >
        <span :class="question.cssClasses.slider">
          <span v-if="question.cssClasses.sliderText && question.isDeterminated" :class="question.cssClasses.sliderText">
            <survey-string :locString="question.getCheckedLabel()"></survey-string>
          </span>
        </span>
      </div>
      <div
        :class="question.cssClasses.sliderGhost"
        v-on:click="onLabelClick($event, !question.swapOrder)"
      ><span :class="question.getLabelCss(!question.swapOrder)"
        ><survey-string :locString="question.locLabelRight"></survey-string
      ></span>
      </div>
    </label>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { Boolean } from "./boolean";

@Component
export class BooleanSwitch extends Boolean {}

Vue.component("survey-boolean", BooleanSwitch);

export default BooleanSwitch;
</script>
