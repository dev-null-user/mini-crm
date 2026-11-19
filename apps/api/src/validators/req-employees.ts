import z from "zod";
import { checkValid } from ".";

const ValidReqEmployees = (params: any): any => {
    const zValid = z.object({
        fullName: z.string(),
    });

    return checkValid(zValid, {params});
}

export default ValidReqEmployees;
