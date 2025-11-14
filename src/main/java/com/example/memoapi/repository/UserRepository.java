package com.example.memoapi.repository;

import com.example.memoapi.dto.User;
import com.example.memoapi.mapper.UserMapper;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {
    private final UserMapper userMapper;

    public UserRepository(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public User selectUserByUsername(String username) {
        return userMapper.selectUserByUsername(username);
    }
}
