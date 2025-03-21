export enum HttpStatus {
  /**
   * CONTINUE (100): Được sử dụng để thông báo rằng server đã nhận được phần đầu của yêu cầu và đang chờ nhận các phần tiếp theo.
   */
  CONTINUE = 100,
  /**
   * SWITCHING_PROTOCOLS (101): Được sử dụng để thông báo rằng server đồng ý chuyển đổi giao thức được yêu cầu trong yêu cầu "Upgrade" của client.
   */
  SWITCHING_PROTOCOLS = 101,
  /**
   * PROCESSING (102): Được sử dụng để thông báo rằng server đang xử lý yêu cầu nhưng chưa hoàn thành.
   */
  PROCESSING = 102,
  /**
   * EARLYHINTS (103): Được sử dụng để thông báo rằng server đã bắt đầu gửi phần trước của phản hồi và client nên chờ đợi để tiếp tục nhận phần còn lại.
   */
  EARLYHINTS = 103,
  /**
   * OK (200): Yêu cầu đã được xử lý thành công.
   */
  OK = 200,
  /**
   * CREATED (201): Yêu cầu đã được xử lý thành công và đã tạo mới tài nguyên.
   */
  CREATED = 201,
  /**
   * ACCEPTED (202): Yêu cầu đã được chấp nhận để xử lý, nhưng xử lý thực tế có thể diễn ra ở tương lai.
   */
  ACCEPTED = 202,
  /**
   * NON_AUTHORITATIVE_INFORMATION (203): Yêu cầu đã được xử lý thành công, nhưng thông tin trả về có thể không phải là thông tin chính thức từ nguồn tài nguyên.
   */
  NON_AUTHORITATIVE_INFORMATION = 203,
  /**
  NO_CONTENT (204): Yêu cầu đã được xử lý thành công, nhưng không có nội dung trả về.
   */
  NO_CONTENT = 204,
  /**
   * RESET_CONTENT (205): Yêu cầu đã được xử lý thành công, và client nên làm mới (refresh) trang hiện tại.
   */
  RESET_CONTENT = 205,
  /**
   * PARTIAL_CONTENT (206): Yêu cầu được chỉ định một phần của tài nguyên đã được gửi thành công.
   */
  PARTIAL_CONTENT = 206,
  /**
   * AMBIGUOUS (300): Yêu cầu có nhiều lựa chọn và server không thể tự động chọn một lựa chọn duy nhất.
   */
  AMBIGUOUS = 300,
  /**
   * MOVED_PERMANENTLY (301): Tài nguyên đã được chuyển hướng vĩnh viễn sang một địa chỉ mới.
   */
  MOVED_PERMANENTLY = 301,
  /**
   * FOUND (302): Tài nguyên đã được chuyển hướng tạm thời sang một địa chỉ mới.
   */
  FOUND = 302,
  /**
   * SEE_OTHER (303): Client nên thực hiện yêu cầu mới đến địa chỉ đã được cung cấp.
   */
  SEE_OTHER = 303,
  /**
   * NOT_MODIFIED (304): Tài nguyên không thay đổi từ lần truy cập trước đó.
   */
  NOT_MODIFIED = 304,
  /**
   * TEMPORARY_REDIRECT (307): Yêu cầu sẽ được chuyển hướng tạm thời sang một địa chỉ mới.
   */
  TEMPORARY_REDIRECT = 307,
  /**
   * PERMANENT_REDIRECT (308): Yêu cầu sẽ được chuyển hướng vĩnh viễn sang một địa chỉ mới.
   */
  PERMANENT_REDIRECT = 308,
  /**
   * BAD_REQUEST (400): Yêu cầu của client không hợp lệ.
   */
  BAD_REQUEST = 400,
  /**
   * UNAUTHORIZED (401): Client cần xác thực (authenticate) để truy cập tài nguyên.
   */
  UNAUTHORIZED = 401,
  /**
   * PAYMENT_REQUIRED (402): Đã được dành cho việc sử dụng trong tương lai.
   */
  PAYMENT_REQUIRED = 402,
  /**
   * FORBIDDEN (403): Client không có quyền truy cập tài nguyên được yêu cầu.
   */
  FORBIDDEN = 403,
  /**
   * NOT_FOUND (404): Tài nguyên được yêu cầu không tồn tại trên server.
   */
  NOT_FOUND = 404,
  /**
   * METHOD_NOT_ALLOWED (405): Phương thức yêu cầu không được hỗ trợ cho tài nguyên đã cho.
   */
  METHOD_NOT_ALLOWED = 405,
  /**
   * NOT_ACCEPTABLE (406): Server không thể sinh ra nội dung phù hợp với các tiêu chuẩn của yêu cầu "Accept" của client.
   */
  NOT_ACCEPTABLE = 406,
  /**
   * PROXY_AUTHENTICATION_REQUIRED (407): Client cần xác thực với proxy để truy cập tài nguyên.
   */
  PROXY_AUTHENTICATION_REQUIRED = 407,
  /**
   * REQUEST_TIMEOUT (408): Client đã không gửi yêu cầu trong khoảng thời gian cho phép.
   */
  REQUEST_TIMEOUT = 408,
  /**
   * CONFLICT (409): Yêu cầu xung đột với trạng thái hiện tại của tài nguyên.
   */
  CONFLICT = 409,
  /**
   * GONE (410): Tài nguyên đã không còn tồn tại trên server.
   */
  GONE = 410,
  /**
   * LENGTH_REQUIRED (411): Server yêu cầu một trường "Content-Length" không được gửi trong yêu cầu của client.
   */
  LENGTH_REQUIRED = 411,
  /**
   * PRECONDITION_FAILED (412): Một hoặc nhiều tiền điều kiện đã không thành công khi xử lý yêu cầu.
   */
  PRECONDITION_FAILED = 412,
  /**
   * PAYLOAD_TOO_LARGE (413): Kích thước yêu cầu quá lớn để server xử lý.
   */
  PAYLOAD_TOO_LARGE = 413,
  /**
   * URI_TOO_LONG (414): URI của yêu cầu quá dài để server xử lý.
   */
  URI_TOO_LONG = 414,
  /**
   * UNSUPPORTED_MEDIA_TYPE (415): Định dạng phương thức truyền không được server hỗ trợ cho yêu cầu.
   */
  UNSUPPORTED_MEDIA_TYPE = 415,
  /**
   * REQUESTED_RANGE_NOT_SATISFIABLE (416): Một hoặc nhiều phạm vi yêu cầu không hợp lệ hoặc không thể đáp ứng được.
   */
  REQUESTED_RANGE_NOT_SATISFIABLE = 416,
  /**
   * EXPECTATION_FAILED (417): Server không thể đáp ứng với tiêu chuẩn trong trường "Expect" của yêu cầu.
   */
  EXPECTATION_FAILED = 417,
  /**
   * I_AM_A_TEAPOT (418): Server là một ấm đun nước (teapot) và không thể đáp ứng yêu cầu để trà.
   */
  I_AM_A_TEAPOT = 418,
  /**
   * MISDIRECTED (421): Yêu cầu đã gửi tới server không phù hợp.
   */
  MISDIRECTED = 421,
  /**UNPROCESSABLE_ENTITY (422): Yêu cầu không thể được xử lý bởi server.
   */
  UNPROCESSABLE_ENTITY = 422,
  /**
   * FAILED_DEPENDENCY (424): Yêu cầu thất bại do phụ thuộc không thành công.
   */
  FAILED_DEPENDENCY = 424,
  /**
   * PRECONDITION_REQUIRED (428): Server yêu cầu một tiền điều kiện để tiếp tục xử lý yêu cầu.
   */
  PRECONDITION_REQUIRED = 428,
  /**
   * TOO_MANY_REQUESTS (429): Client đã gửi quá nhiều yêu cầu trong một khoảng thời gian cho phép.
   */
  TOO_MANY_REQUESTS = 429,
  /**
   * INTERNAL_SERVER_ERROR (500): Server gặp lỗi nội bộ khi xử lý yêu cầu.
   */
  INTERNAL_SERVER_ERROR = 500,
  /**
   * NOT_IMPLEMENTED (501): Server không hỗ trợ tính năng được yêu cầu.
   */
  NOT_IMPLEMENTED = 501,
  /**
   * BAD_GATEWAY (502): Server đóng vai trò là một cổng (gateway) hoặc proxy và nhận được phản hồi không hợp lệ từ server upstream.
   */
  BAD_GATEWAY = 502,
  /**
   * SERVICE_UNAVAILABLE (503): Server không thể xử lý yêu cầu do quá tải hoặc bảo trì.
   */
  SERVICE_UNAVAILABLE = 503,
  /**
   * GATEWAY_TIMEOUT (504): Server đóng vai trò là một cổng hoặc proxy và không nhận được phản hồi kịp thời từ server upstream.
   */
  GATEWAY_TIMEOUT = 504,
  /**
   * HTTP_VERSION_NOT_SUPPORTED (505): Server không hỗ trợ phiên bản giao thức HTTP được yêu cầu trong yêu cầu.
   */
  HTTP_VERSION_NOT_SUPPORTED = 505
}
