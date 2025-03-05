export default class Response {
  status: number;
  message: string[];
  error: string[];
  data: any;

  constructor(status: number, message = [], error = [], data = {}) {
    this.status = status;
    this.message = message;
    this.error = error;
    this.data = data;
  }
}
