package com.example.demo.services.catalog;

import com.example.demo.entity.Catalog;

import java.util.List;
import java.util.Optional;

public interface catalogService {
    List<Catalog> getAllCatalogs();
    Optional<Catalog> getCatalogById(Long id);
    Catalog createCatalog(Catalog catalog);
    Catalog updateCatalog(Long id, Catalog catalog);
    void deleteCatalog(Long id);
}
