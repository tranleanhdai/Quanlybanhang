package com.example.demo.controllers;

import com.example.demo.entity.Catalog;
import com.example.demo.services.catalog.catalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
public class catalogController {

    private final catalogService catalogService;

    @GetMapping
    public List<Catalog> getAllCatalogs() {
        return catalogService.getAllCatalogs();
    }

    @GetMapping("/{id}")
    public Optional<Catalog> getCatalogById(@PathVariable Long id) {
        return catalogService.getCatalogById(id);
    }

    @PostMapping
    public Catalog createCatalog(@RequestBody Catalog catalog) {
        return catalogService.createCatalog(catalog);
    }

    @PutMapping("/{id}")
    public Catalog updateCatalog(@PathVariable Long id, @RequestBody Catalog catalog) {
        return catalogService.updateCatalog(id, catalog);
    }

    @DeleteMapping("/{id}")
    public void deleteCatalog(@PathVariable Long id) {
        catalogService.deleteCatalog(id);
    }
}
