<template>
  <div :class="getItemClass(item)">
    <label :class="question.cssClasses.label">
      <input
        v-if="question.multiSelect"
        type="checkbox"
        :name="question.questionName"
        :value="item.value"
        :id="question.getItemId(item)"
        v-model="value"
        :disabled="!question.getItemEnabled(item)"
        :readonly="question.isReadOnlyAttr"
        :required="question.inputRequiredAttribute"
        :aria-label="item.locText.renderedHtml"
        :aria-invalid="question.ariaInvalid"
        :aria-errormessage="question.ariaErrormessage"
        :class="question.cssClasses.itemControl"
      />
      <input
        v-else
        type="radio"
        :name="question.questionName"
        :value="item.value"
        :id="question.getItemId(item)"
        v-model="value"
        :disabled="!question.getItemEnabled(item)"
        :readonly="question.isReadOnlyAttr"
        :required="question.hasRequiredError()"
        :aria-label="item.locText.renderedHtml"
        :aria-invalid="question.ariaInvalid"
        :aria-errormessage="question.ariaErrormessage"
        :class="question.cssClasses.itemControl"
      />
      <div :class="question.cssClasses.itemDecorator">
        <div :class="question.cssClasses.imageContainer">
          <span
            v-if="question.cssClasses.checkedItemDecorator"
            :class="question.cssClasses.checkedItemDecorator"
            aria-hidden="true"
          >
            <SvComponent
              :is="'sv-svg-icon'"
              v-if="question.cssClasses.checkedItemSvgIconId"
              v-bind:class="question.cssClasses.checkedItemSvgIcon"
              size="auto"
              :iconName="question.cssClasses.checkedItemSvgIconId"
            ></SvComponent>
          </span>
          <img
            v-if="
              imageLink &&
              !item.contentNotLoaded &&
              question.contentMode === 'image'
            "
            :class="question.cssClasses.image"
            :src="imageLink"
            :width="question.renderedImageWidth"
            :height="question.renderedImageHeight"
            v-bind:style="{ objectFit: question.imageFit as any }"
            :alt="item.locText.renderedHtml"
            @load="
              (event) => {
                question.onContentLoaded(item, event);
              }
            "
            @error="
              (event) => {
                item.onErrorHandler();
              }
            "
          /><video
            controls
            v-if="
              imageLink &&
              !item.contentNotLoaded &&
              question.contentMode === 'video'
            "
            :class="question.cssClasses.image"
            :src="imageLink"
            :width="question.renderedImageWidth"
            :height="question.renderedImageHeight"
            v-bind:style="{ objectFit: question.imageFit as any }"
            @loadedmetadata="
              (event) => {
                question.onContentLoaded(item, event);
              }
            "
            @error="
              (event) => {
                item.onErrorHandler();
              }
            "
          ></video>
          <div
            v-if="!imageLink || item.contentNotLoaded"
            :class="question.cssClasses.itemNoImage"
            v-bind:style="{
              width: question.renderedImageWidth + 'px',
              height: question.renderedImageHeight + 'px',
              objectFit: question.imageFit as any,
            }"
          >
            <SvComponent
              :is="'sv-svg-icon'"
              :class="question.cssClasses.itemNoImageSvgIcon"
              :iconName="question.cssClasses.itemNoImageSvgIconId"
              :size="48"
            ></SvComponent>
          </div>
        </div>
        <span v-if="question.showLabel" :class="question.cssClasses.itemText">
          <SvComponent :is="'survey-string'" :locString="item.locText" />
        </span>
      </div>
    </label>
  </div>
</template>

<script lang="ts" setup>
import SvComponent from "@/SvComponent.vue";
import type { ImageItemValue, QuestionImagePickerModel } from "survey-core";
import { useBase, useLocString } from "./base";
import { computed } from "vue";
defineOptions({ inheritAttrs: false });
const props = defineProps<{
  question: QuestionImagePickerModel;
  item: ImageItemValue;
}>();
const getItemClass = (item: any) => {
  return props.question.getItemClass(item);
};
const value = computed({
  get() {
    return props.question.value;
  },
  set(value) {
    const question = props.question;
    if (question.isReadOnlyAttr) return;
    question.value = value;
  },
});
useBase(() => props.item);
const imageLink = useLocString(() => props.item.locImageLink);
</script>
