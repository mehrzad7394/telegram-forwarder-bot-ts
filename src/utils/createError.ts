interface CustomError extends Error {
  status?: number;
}

const createError = (status: number, message: string): CustomError => {
  const err = new Error(message) as CustomError;
  err.status = status;
  return err;
};

export default createError;
