#[macro_use]
extern crate neon;
extern crate cpp_utils;
extern crate libc;
extern crate qt_core;
extern crate qt_widgets;

use neon::vm::{Call, JsResult};
use neon::js::{Value, JsNull, JsString, JsValue};
use neon::js::error::{JsError, Kind as ErrorKind};

pub mod qt;

fn open_file_sync(call: Call) -> JsResult<JsValue> {
  match qt::open_file_sync(&qt::OpenFileOptions { start_path: Option::None, title: Option::None }) {
    Ok(None) => {
      Ok(JsNull::new().as_value(call.scope))
    }
    Ok(Some(path_buf)) => {
      let string: String = path_buf.into_os_string().into_string().unwrap();
      Ok(JsString::new(call.scope, &string).unwrap().as_value(call.scope))
    }
    Err(err) => {
      JsError::throw(ErrorKind::Error, &format!("{:?}", err))
    }
  }
}

register_module!(m, {
    m.export("openFileSync", open_file_sync)
});
