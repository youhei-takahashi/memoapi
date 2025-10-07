package com.example.memoapi.service;

import com.example.memoapi.dto.Note;
import com.example.memoapi.exception.NoteArgumentNotValidException;
import com.example.memoapi.exception.NoteNotFoundException;
import com.example.memoapi.repository.NoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NoteService {

    private final NoteRepository noteRepository;

    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    public List<Note> findAll() {
        return noteRepository.findAll();
    }

    public Note insert(Note note) {

        // title が空の場合のチェック
        if (note.getTitle() == null || note.getTitle().isEmpty()) {
            throw new NoteArgumentNotValidException("note title is empty");
        }

        // content が空の場合のチェック
        if (note.getContent() == null || note.getContent().isEmpty()) {
            throw new NoteArgumentNotValidException("note content is empty");
        }

        noteRepository.insert(note);
        return note;
    }

    public Note findById(long id) {
        Note note = noteRepository.findById(id);

        if (note == null) {
            throw new NoteNotFoundException(id);
        }

        return note;
    }
}
