import { writable } from "svelte/store";

export const trainerADD = writable("heihi", set => {
    console.log("trainerADD 구독");
    return () => {
        console.log("trainerADD 구독 취소");
    }
});

