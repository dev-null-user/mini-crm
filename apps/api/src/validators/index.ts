import { z } from 'zod';
import { ValidationError } from '../errors/validation-error';


export type ValidationResult =
  | {params: object}
  | {
      errors: {
        path: string;
        code: string;
        message: string;
      }[];
    };

export const checkValid = <T extends z.ZodType>(
  validObj: T,
  request: { params: unknown }
): z.infer<T> => {
  const result = validObj.safeParse(request.params);

  if (!result.success) {
    throw new ValidationError({
      errors: result.error.issues.map((issue) => ({
        path: issue.path.map(String).join('.') || '_root',
        code: issue.code,
        message: issue.message,
      })),
    });
  }

  return result.data;
};
