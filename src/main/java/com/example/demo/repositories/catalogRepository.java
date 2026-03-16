package com.example.demo.repositories;

import com.example.demo.entity.Catalog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface catalogRepository extends JpaRepository<Catalog,Long> {
}
