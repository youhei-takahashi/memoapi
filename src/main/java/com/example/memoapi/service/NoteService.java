package com.example.memoapi.service;

import com.example.memoapi.dto.Note;
import com.example.memoapi.exception.NoteArgumentNotValidException;
import com.example.memoapi.exception.NoteNotFoundException;
import com.example.memoapi.repository.NoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public boolean delete(long id) {
        if (!noteRepository.delete(id)) {
            throw new NoteNotFoundException(id);
        }

        return true;
    }

    @Transactional
    public Note update(Note note, long id) {
        // title が空の場合のチェック
        if (note.getTitle() == null || note.getTitle().isEmpty()) {
            throw new NoteArgumentNotValidException("note title is empty");
        }

        // content が空の場合のチェック
        if (note.getContent() == null || note.getContent().isEmpty()) {
            throw new NoteArgumentNotValidException("note content is empty");
        }

        // 指定されたIDが存在しない場合のエラー
        Note target = noteRepository.findById(id);
        if (target == null) {
            throw new NoteNotFoundException(id);
        }

        note.setId(id);
        note.setCreatedAt(target.getCreatedAt());

        return noteRepository.update(note);
    }
}
