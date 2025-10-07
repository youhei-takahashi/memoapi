package com.example.memoapi.exception;

public class NoteNotFoundException extends RuntimeException {
    public NoteNotFoundException(long id) {
        super("指定されたIDのメモは見つかりません: " + id);
    }
}
