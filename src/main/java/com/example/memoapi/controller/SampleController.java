package com.example.memoapi.controller;

import com.example.memoapi.dto.SampleMessage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SampleController {

    @GetMapping("/sample")
    public String sample() {
        return "Hello, Spring Web API";
    }

    @GetMapping("/sample/api")
    public ResponseEntity<SampleMessage> sampleApi() {
        SampleMessage sampleMessage = new SampleMessage();
        sampleMessage.setId(10001);
        sampleMessage.setMessage("Hello, Spring Web API");
        sampleMessage.setCount(100);

        return new ResponseEntity<>(sampleMessage, HttpStatus.OK);
    }
}
