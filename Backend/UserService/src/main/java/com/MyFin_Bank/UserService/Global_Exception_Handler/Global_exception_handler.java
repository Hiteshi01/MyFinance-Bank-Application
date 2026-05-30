package com.MyFin_Bank.UserService.Global_Exception_Handler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@ControllerAdvice
public class Global_exception_handler{

@ExceptionHandler(RuntimeException.class)
public ResponseEntity<String> handleException(RuntimeException ex){

return ResponseEntity.badRequest().body(ex.getMessage());

	


}


}