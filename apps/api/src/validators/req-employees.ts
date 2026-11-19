import z from "zod";
import { checkValid } from ".";

const ValidReqEmployees = (params: any): any => {
    const zValid = z.object({
        fullName: z.string().nonempty("Параметр должен указан"),
    });

    return checkValid(zValid, {params});
}

export default ValidReqEmployees;
