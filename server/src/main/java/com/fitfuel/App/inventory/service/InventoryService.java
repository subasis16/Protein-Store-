package com.fitfuel.App.inventory.service;

import org.springframework.stereotype.Service;

@Service
public class InventoryService {

    /*
     Inventory implementation currently lives in:

     CartService   -> stock validation
     OrderService  -> pre-order stock validation
     PaymentService -> stock deduction after payment

     Future refactor can centralize inventory logic here.
    */

}
