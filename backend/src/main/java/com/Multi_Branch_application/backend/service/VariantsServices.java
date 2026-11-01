package com.Multi_Branch_application.backend.service;

import com.Multi_Branch_application.backend.dto.MessageResponse;
import com.Multi_Branch_application.backend.dto.VariantsRequestDTO;
import com.Multi_Branch_application.backend.entity.Variants;
import com.Multi_Branch_application.backend.entity.Variants_type;
import com.Multi_Branch_application.backend.repository.VariantsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;

@Service
public class VariantsServices {

    @Autowired
    VariantsRepository variantsRepository;

//    public List<Variants> getAllVariants(){return variantsRepository.findAll();}
public Map<Variants_type, List<Variants>> getAllVariants() {
    return variantsRepository.findAll()
            .stream()
            .collect(Collectors.groupingBy(
                    Variants::getName,
                    LinkedHashMap::new,
                    Collectors.toList()
            ));
}

    public ResponseEntity<?> createVariants(VariantsRequestDTO requestDTO){

        Variants variants = new Variants();
        variants.setName(Variants_type.valueOf(String.valueOf(requestDTO.getName())));
        variants.setValue(requestDTO.getValue());

        variantsRepository.save(variants);

        return ResponseEntity.ok(new MessageResponse("variants is create successfully"));
    }

    public ResponseEntity<?> updateVariants(Long id,VariantsRequestDTO requestDTO){

        Optional<Variants> getVariants = variantsRepository.findById(id);

        if(!getVariants.isPresent()){
            return ResponseEntity.ok(new MessageResponse("variants is not found"));
        }

        Variants variants = getVariants.get();
        variants.setValue(requestDTO.getValue());

        variantsRepository.save(variants);

        return ResponseEntity.ok(new MessageResponse("variants is Updated successfully"));
    }

}
