package com.example.memoapi.controller;

import com.example.memoapi.dto.Note;
import com.example.memoapi.service.NoteService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public ResponseEntity<List<Note>> findAll() {
        List<Note> notes = noteService.findAll();
//        return new ResponseEntity<>(notes, HttpStatus.OK);
        return ResponseEntity.ok(notes);
    }

    @PostMapping
    public ResponseEntity<Note> save(@RequestBody Note note,
                                     UriComponentsBuilder uriBuilder) {
        Note createdNote = noteService.insert(note);

        URI location = uriBuilder.path("/api/notes/{id}")
                .buildAndExpand(createdNote.getId()).toUri();

//        HttpHeaders headers = new HttpHeaders();
//        headers.setLocation(location);
//        return new ResponseEntity<>(createdNote, headers, HttpStatus.CREATED);

        return ResponseEntity.created(location).body(createdNote);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Note> findById(@PathVariable long id) {
        Note note = noteService.findById(id);

        return ResponseEntity.ok(note);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        noteService.delete(id);

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> update(@PathVariable long id,
                                       @RequestBody Note note) {
        noteService.update(note, id);

        return ResponseEntity.ok(note);
    }
}


