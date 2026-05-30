package com.MyFin_Bank.SupportService.Global_Exception_Handler;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex){

        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);

    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneralException(Exception ex){

        return new ResponseEntity<>("Server Error: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);

    }

}	