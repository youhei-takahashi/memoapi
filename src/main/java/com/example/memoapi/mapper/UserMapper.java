package com.example.memoapi.mapper;

import com.example.memoapi.dto.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper {

    @Select("SELECT user_id, username, password, created_at FROM users WHERE username = #{username}")
    User selectUserByUsername(String username);
}
