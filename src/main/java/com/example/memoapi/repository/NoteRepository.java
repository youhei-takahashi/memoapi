package com.example.memoapi.repository;

import com.example.memoapi.dto.Note;
import com.example.memoapi.exception.NoteNotFoundException;
import com.example.memoapi.mapper.NoteMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class NoteRepository {

    private final NoteMapper noteMapper;

    public NoteRepository(NoteMapper noteMapper) {
        this.noteMapper = noteMapper;
    }

    public List<Note> findAll() {
        return noteMapper.findAll();
    }

    public int insert(Note note) {
        return noteMapper.insert(note);
    }

    public Note findById(long id) {
        return noteMapper.findById(id);
    }

    public boolean delete(long id) {
        return noteMapper.delete(id) > 0;
    }

    public Note update(Note note) {
        if (noteMapper.update(note) == 0) {
            throw new NoteNotFoundException(note.getId());
        }

        return note;
    }
}
