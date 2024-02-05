import { writable } from "svelte/store";

export const trainerADD = writable("");

export function setADD(ADD){
    trainerADD.set(ADD);
}