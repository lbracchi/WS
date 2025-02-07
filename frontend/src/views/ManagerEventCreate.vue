<template lang="pug">
b-container.mb-5
  b-row.justify-content-center.my-5
    b-col(lg='6' md='8' cols='11')
      hr.shaded
      h4.text-center
        b CREATE AN EVENT
      hr.shaded
  b-row.justify-content-center
    b-col(lg='6' md='8' cols='11')
      b-alert(show='show')
        b-row(align-v='center')
          b-col(cols='auto')
            h1
              Icon(bootstrap icon='info')
          b-col
            p.m-0
              | Create events in your city. Your events will be displayed in the main page and visible to all the users.
      hr
      b-form(@submit.stop.prevent='createEvent')
        InputText(title='Title:' placeholder='Insert title here' :text='form.eventTitle' required @data='(e) => { form.eventTitle = e; }')
        InputTextarea(title='Description:' placeholder='Insert description here' :text='form.description' @data='(e) => { form.description = e; }')
        InputDate(title='Date:' placeholder='Select a date' :date='form.date' required @data='(e) => { form.date = e; }')
        hr
        InputAddress(title='Location:' :city='form.address.city' :street='form.address.street' :civic='form.address.civicNumber' :x='form.address.coordinates.x' :y='form.address.coordinates.y' @data='(e) => { form.address = e; }')
        hr
        b-row.mt-3
          b-col
            b-button(block variant='secondary' @click="$router.push({ name: 'ManagerEventList' })") Cancel
          b-col
            b-button.color3(block type='submit') {{ this.submitLabel }}

</template>

<script lang="ts">
import Vue from "vue";
import eventbus from "../eventbus";

import InputText from "../components/input/InputText.vue";
import InputTextarea from "../components/input/InputTextarea.vue";
import InputAddress from "../components/input/InputAddress.vue";
import InputDate from "../components/input/InputDate.vue";
import Icon from "../components/Icon.vue";

import { Address, EventPayload } from "../types/types";
import { ManagerEventCreateView } from "../types/viewTypes";

import api from "../api/event";
import { AxiosError } from "axios";

export default Vue.extend({
  name: "ManagerEventCreate",
  components: {
    InputText,
    InputTextarea,
    InputAddress,
    InputDate,
    Icon,
  },
  data: (): ManagerEventCreateView => {
    return {
      form: {
        _id: null,
        ownerVolunteerId: "",
        eventTitle: "",
        description: "",
        address: {
          city: "",
          street: "",
          civicNumber: "",
          coordinates: {
            x: 0,
            y: 0,
          },
        } as Address,
      } as EventPayload,
      submitLabel: "Create",
    };
  },
  created() {
    this.form.ownerVolunteerId = this.$store.state.session.userData._id;

    if ("event" in this.$route.params) {
      this.form = this.$route.params.event as unknown as EventPayload;
      this.submitLabel = "Edit";
    }
  },
  methods: {
    createEvent(): void {
      var fun;
      if ("event" in this.$route.params) fun = api.editEvent;
      else fun = api.createEvent;

      fun(this.form)
        .then((): void => {
          this.$router.push({ name: "ManagerEventList" });
          eventbus.$emit(
            "successMessage",
            "Events",
            "Event created succesfully."
          );
        })
        .catch((e: AxiosError): void => {
          if (e.response.status == 401) {
            eventbus.$emit("logout");
            eventbus.$emit("errorMessage", "User session", "Session expired.");
            this.$router.push({ name: "Login" });
          } else
            eventbus.$emit(
              "errorMessage",
              "Events",
              "Unable to create the event. Retry later or contact us if the problem persists."
            );
        });
    },
  },
});
</script>

<style scoped lang="scss"></style>
