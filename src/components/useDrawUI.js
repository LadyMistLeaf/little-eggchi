import { useEffect } from "react";
import { PIXEL_SIZE } from "./constants";

export const useDrawUI = (context, bar, arrowLeft, arrowRight, check, shouldRerender) => {
    useEffect(() => {
        if (context === undefined) {
            return;
        }

        context.drawImage(bar, 0, 35 * PIXEL_SIZE);
        context.drawImage(arrowLeft, 8 * PIXEL_SIZE, 37 * PIXEL_SIZE);
        context.drawImage(arrowRight, 48 * PIXEL_SIZE, 37 * PIXEL_SIZE);
        context.drawImage(check, 28 * PIXEL_SIZE, 37 * PIXEL_SIZE);
    }, [context, bar, arrowLeft, arrowRight, check, shouldRerender]);
};
