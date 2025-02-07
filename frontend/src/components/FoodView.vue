<template lang="pug">
div
  b-tabs(content-class='mt-3' v-if="!removeExpired")
    b-tab(title='Near expiration' @click="selectTab('near_expiration')" :active="selectedTab == 'near_expiration'")
    b-tab(title='Expired' @click="selectTab('expired')" :active="selectedTab == 'expired'")
    b-tab(title='All' @click="selectTab('all')" :active="selectedTab == 'all'")

  b-row.justify-content-center(:align-h='$store.getters.isMediumScreenWidth ? null : "between"')
    b-col(lg='6' md='8' cols='10')
      b-form-group
        b-input-group
          b-form-input(v-model='filter' type='search' placeholder='Type to search' size='sm')
          b-input-group-append
            b-button(:disabled='!filter' @click="filter = ''" size='sm') Clear
    b-col(md='auto' cols='10')
      b-pagination(v-model='currentPage' :total-rows='totalRows' :per-page='perPage' align='fill' size='sm')
  
    b-col(md='12' cols='10')
      b-table(show-empty striped='striped' hover='hover' :fields='tableFields' :items='foodList' :current-page='currentPage' :per-page='perPage' :filter='filter' :filter-included-fields='filterOn' :sort-by.sync='sortBy' :sort-desc.sync='sortDesc' :sort-direction='sortDirection' @filtered='onFiltered')
        template(#cell(load)='{ item }')
          b-button(@click='load(item)' size='sm') Edit
        template(#cell(labels)='data')
          b-badge.mr-1(v-for='(label, idx) in data.value' variant='success' :key="idx") {{ label }}
        template(#cell(selected)='{ item }')
          b-form-spinbutton(inline min=0 value=0 :max="item.number" v-model="item.selected" @change='updateFoods(item)')
        template(#cell(delete)='{ item }')
          b-button.color3(block size='sm' v-b-modal.modal @click='deleteFoodId = item._id') Delete
        template(#empty='scope')
          h4.text-center There are no records to show
        template(#emptyfiltered='scope')
          h4.text-center There are no records matching your request
      b-modal#modal(title='Delete the selected food?' @ok='deleteFood(deleteFoodId)')
        div The selected food will be deleted permanently.
        template(#modal-footer='{ ok, cancel }')
          b-button(variant='secondary' @click='cancel()') Cancel
          b-button.color3(@click='ok()') Confirm
</template>

<script lang="ts">
import Vue from "vue";
import eventbus from "../eventbus";
import dates from "../misc/dates";

import { SelectableFood } from "../types/types";
import { FoodViewComponent } from "../types/componentTypes";

import api from "../api/food";
import { AxiosError, AxiosResponse } from "axios";

export default Vue.extend({
  name: "FoodView",
  props: {
    selectableItems: Boolean,
    removeExpired: Boolean,
    loadableItems: Boolean,
    deletableItem: Boolean,
  },
  data: (): FoodViewComponent => {
    return {
      selectedTab: "all",
      foodList: new Array<SelectableFood>(),
      foodListBackup: new Array<SelectableFood>(),
      tableFields: [
        {
          key: "load",
          label: "",
          sortable: false,
        },

        {
          key: "name",
          label: "Name",
          sortable: true,
        },
        {
          key: "number",
          label: "Number",
          sortable: true,
        },
        {
          key: "expirationDate",
          label: "Expiration Date",
          sortable: true,
          formatter: (value) => {
            return dates.formatDate(value);
          },
        },
        {
          key: "labels",
          label: "Labels",
          sortable: false,
        },
        {
          key: "selected",
          label: "Selected",
          sortable: true,
        },
        {
          key: "delete",
          label: "",
          sortable: false,
        },
      ],
      totalRows: 0,
      currentPage: 1,
      perPage: 10,
      filter: "",
      filterOn: ["name", "labels"],
      sortBy: "",
      sortDesc: false,
      sortDirection: "asc",
      index: 0,
      deleteFoodId: "",
    };
  },
  created() {
    if (!this.selectableItems)
      this.tableFields = this.tableFields.filter(
        (elem) => elem.key != "selected"
      );
    if (!this.loadableItems)
      this.tableFields = this.tableFields.filter((elem) => elem.key != "load");
    if (!this.deletableItem)
      this.tableFields = this.tableFields.filter(
        (elem) => elem.key != "delete"
      );

    eventbus.$emit("startLoading", "Loading available foods");
    api
      .foodList({ filter: { number: { $gt: 0 } } })
      .then((r: AxiosResponse): void => {
        if (this.removeExpired) {
          this.foodListBackup = r.data as SelectableFood[];
          this.foodListBackup = this.foodListBackup.filter(
            (f) => !dates.isPastDate(f.expirationDate)
          );
        } else this.foodListBackup = r.data as SelectableFood[];
        this.selectTab("all");
      })
      .catch((e: AxiosError): void => {
        console.log(e);
      })
      .then(() => {
        eventbus.$emit("stopLoading");
      });
  },
  methods: {
    selectTab(mode: string) {
      this.selectedTab = mode;
      if (mode == "all") {
        this.foodList = this.foodListBackup;
      } else if (mode == "expired") {
        this.foodList = this.foodListBackup.filter((f) =>
          dates.isPastDate(f.expirationDate)
        );
      } else if (mode == "near_expiration") {
        this.foodList = this.foodListBackup.filter(
          (f) =>
            !dates.isPastDate(f.expirationDate) &&
            dates.daysTillDate(f.expirationDate) <= 7
        );
      }

      this.totalRows = this.foodList.length;
      this.currentPage = 1;
    },
    onFiltered(filteredItems: SelectableFood[]) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    updateFoods() {
      this.$emit(
        "data",
        this.foodList.filter((f: SelectableFood) => f.selected)
      );
    },
    load(item: SelectableFood) {
      this.$emit("load", item);
    },
    deleteFood(id: string) {
      api
        .deleteFood({ id: id })
        .then((): void => {
          this.foodList = this.foodList.filter((e) => e._id != id);
          eventbus.$emit(
            "successMessage",
            "Foods",
            "Food deleted successfully.",
            this
          );
        })
        .catch((): void => {
          eventbus.$emit(
            "errorMessage",
            "Foods",
            "Unable to delete selected foods. Retry later or contact us if the problem persists."
          );
        });
    },
  },
});
</script>

<style scoped lang="scss"></style>
