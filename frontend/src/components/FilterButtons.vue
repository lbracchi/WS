<template lang="pug">
div
  b-button.ml-2.mb-2.filter-button(v-for='(filter, idx) in filters' :key='idx' v-if='filter.isVisible' pill='pill' variant='secondary' size='sm' @click='onClick(filter.name)' :class="{ 'color1': selectedFilter == filter.name }")
    span.mr-1 {{ filter.label }}
    Icon(bootstrap :icon='filter.icon' v-if='filter.icon')
</template>

<script lang="ts">
import Vue from "vue";

import Icon from "./Icon.vue";
import { FilterButtonsComponent } from "../types/componentTypes";

export default Vue.extend({
  name: "FilterButtons",
  components: { Icon },
  props: ["label", "filters", "selected"],
  data: (): FilterButtonsComponent => {
    return {
      selectedFilter: "",
    };
  },
  created() {
    this.selectedFilter = this.filters[this.selected].name;
    this.$emit("click", this.selectedFilter);
  },
  methods: {
    onClick(filter: string): void {
      this.selectedFilter = filter;
      this.$emit("click", filter);
    },
    formatLabel(label: string) {
      return label[0].toUpperCase() + label.slice(1);
    },
  },
});
</script>

<style scoped lang="scss">
@import "@/assets/style.scss";
.filter-button:focus {
  background-color: $color1;
}
</style>
