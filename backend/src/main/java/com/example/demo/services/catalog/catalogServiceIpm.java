package com.example.demo.services.catalog;

import com.example.demo.entity.Catalog;
import com.example.demo.exceptions.AppException;
import com.example.demo.exceptions.ErrorCode;
import com.example.demo.repositories.catalogRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class catalogServiceIpm implements catalogService {

    private final catalogRepository catalogRepository;

    @Override
    public List<Catalog> getAllCatalogs() {
        return catalogRepository.findAll();
    }

    @Override
    public Optional<Catalog> getCatalogById(Long id) {
        return catalogRepository.findById(id);
    }

    @Override
    public Catalog createCatalog(Catalog catalog) {
        return catalogRepository.save(catalog);
    }

    @Override
    public Catalog updateCatalog(Long id, Catalog newCatalog) {
        return catalogRepository.findById(id)
                .map(catalog -> {
                    catalog.setName(newCatalog.getName());
                    catalog.setProducts(newCatalog.getProducts());
                    return catalogRepository.save(catalog);
                })
                .orElseThrow(() -> new AppException(ErrorCode.CATALOG_NOT_FOUND));
    }

    @Override
    public void deleteCatalog(Long id) {
        if (!catalogRepository.existsById(id)) {
            throw new AppException(ErrorCode.CATALOG_NOT_FOUND);
        }
        catalogRepository.deleteById(id);
    }
}
