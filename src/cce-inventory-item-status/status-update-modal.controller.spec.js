/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

describe('StatusUpdateModalController', function() {

    var vm, messageService, modalDeferred, $q, $state, $rootScope, inventoryItem, $controller,
        messages, FUNCTIONAL_STATUS, REASON_FOR_NOT_WORKING, inventoryItemService, saveDeferred;

    beforeEach(function() {
        module('cce-inventory-item-status');

        inject(function($injector) {
            $q = $injector.get('$q');
            $state = $injector.get('$state');
            $rootScope = $injector.get('$rootScope');
            $controller = $injector.get('$controller');
            messageService = $injector.get('messageService');
            FUNCTIONAL_STATUS = $injector.get('FUNCTIONAL_STATUS');
            REASON_FOR_NOT_WORKING = $injector.get('REASON_FOR_NOT_WORKING');
            inventoryItemService = $injector.get('inventoryItemService');
        });

        inventoryItem = {
            reasonNotWorkingOrNotInUse: undefined,
            functionalStatus: FUNCTIONAL_STATUS.FUNCTIONING,
            yearOfDecommission: undefined
        };

        modalDeferred = $q.defer();
        saveDeferred = $q.defer();

        vm = $controller('StatusUpdateModalController', {
            inventoryItem: inventoryItem,
            modalDeferred: modalDeferred
        });

        messages = {
            'cceInventoryItemStatus.obsolete': 'Obsolete',
            'cceInventoryItemStatus.needsSpareParts': 'Needs Spare Parts'
        };

        spyOn(messageService, 'get').andCallFake(function(key) {
            return messages[key];
        });
        spyOn(inventoryItemService, 'save').andReturn(saveDeferred.promise);
        spyOn($state, 'go').andReturn();
    });

    describe('$onInit', function() {

        beforeEach(function() {
            vm.$onInit();
        });

        it('should copy item', function() {
            expect(vm.inventoryItem).not.toBe(inventoryItem);
            expect(vm.inventoryItem).toEqual(inventoryItem);
        });

        it('should pre-set new status', function() {
            expect(vm.newStatus).toEqual(inventoryItem.functionalStatus);
        });

        it('should pre-set reason', function() {
            expect(vm.reason).toEqual(inventoryItem.reasonNotWorkingOrNotInUse);
        });

        it('should expose statuses', function() {
            expect(vm.statuses).toEqual(FUNCTIONAL_STATUS.getStatuses());
        });

        it('should expose reasons', function() {
            expect(vm.reasons).toEqual(REASON_FOR_NOT_WORKING.getReasons());
        });

    });

    describe('getStatusLabel', function() {

        beforeEach(function() {
            vm.$onInit();
        });

        it('should throw exception if status is invalid', function() {
            expect(function() {
                vm.getStatusLabel(undefined);
            }).toThrow('Invalid status');

            expect(function() {
                vm.getStatusLabel('SOME_INVALID_STATUS');
            }).toThrow('Invalid status');
        });

        it('should return localized label', function() {
            expect(vm.getStatusLabel(FUNCTIONAL_STATUS.OBSOLETE)).toEqual('Obsolete');
        });

    });

    describe('getReasonLabel', function() {

        beforeEach(function() {
            vm.$onInit();
        });

        it('should throw exception if reason is invalid', function() {
            expect(function() {
                vm.getReasonLabel(undefined);
            }).toThrow('Invalid reason');

            expect(function() {
                vm.getReasonLabel('SOME_INVALID_REASON');
            }).toThrow('Invalid reason');
        });

        it('should return localized label', function() {
            expect(
                vm.getReasonLabel(REASON_FOR_NOT_WORKING.NEEDS_SPARE_PARTS)
            ).toEqual('Needs Spare Parts');
        });

    });

    describe('isFunctioning', function() {

        beforeEach(function() {
            vm.$onInit();
        });

        it('should return true for FUNCTIONING status', function() {
            expect(vm.isFunctioning(FUNCTIONAL_STATUS.FUNCTIONING)).toBe(true);
        });

        it('should return false for status that is other than FUNCTIONING', function() {
            expect(vm.isFunctioning(FUNCTIONAL_STATUS.NON_FUNCTIONING)).toBe(false);
            expect(vm.isFunctioning(FUNCTIONAL_STATUS.UNSERVICABLE)).toBe(false);
            expect(vm.isFunctioning(FUNCTIONAL_STATUS.AWAITING_REPAIR)).toBe(false);
            expect(vm.isFunctioning(FUNCTIONAL_STATUS.OBSOLETE)).toBe(false);
        });

    });

    describe('save', function() {

        beforeEach(function() {
            vm.$onInit();
        });

        it('should not modify the original inventory item', function() {
            vm.newStatus = FUNCTIONAL_STATUS.OBSOLETE;
            vm.reason = REASON_FOR_NOT_WORKING.NEEDS_SPARE_PARTS;
            vm.yearOfDecommission = 2017;

            vm.save();

            expect(inventoryItem.functionalStatus).toEqual(FUNCTIONAL_STATUS.FUNCTIONING);
            expect(inventoryItem.reasonNotWorkingOrNotInUse).toBeUndefined();
            expect(inventoryItem.yearOfDecommission).toBeUndefined();
        });

        it('should ignore reason and date for FUNCTIONING status', function() {
            vm.newStatus = FUNCTIONAL_STATUS.FUNCTIONING;
            vm.reason = REASON_FOR_NOT_WORKING.NEEDS_SPARE_PARTS;
            vm.yearOfDecommission = 2017;

            vm.save();

            expect(inventoryItemService.save).toHaveBeenCalledWith({
                functionalStatus: FUNCTIONAL_STATUS.FUNCTIONING,
                reasonNotWorkingOrNotInUse: undefined,
                yearOfDecommission: undefined
            });
        });

        it('should ignore date for NON_FUNCTIONING status', function() {
            vm.newStatus = FUNCTIONAL_STATUS.NON_FUNCTIONING;
            vm.reason = REASON_FOR_NOT_WORKING.NEEDS_SPARE_PARTS;
            vm.yearOfDecommission = 2017;

            vm.save();

            expect(inventoryItemService.save).toHaveBeenCalledWith({
                functionalStatus: FUNCTIONAL_STATUS.NON_FUNCTIONING,
                reasonNotWorkingOrNotInUse: REASON_FOR_NOT_WORKING.NEEDS_SPARE_PARTS,
                yearOfDecommission: undefined
            });
        });

        it('should ignore date for AWAITING_REPAIR status', function() {
            vm.newStatus = FUNCTIONAL_STATUS.AWAITING_REPAIR;
            vm.reason = REASON_FOR_NOT_WORKING.NEEDS_SPARE_PARTS;
            vm.yearOfDecommission = 2017;

            vm.save();

            expect(inventoryItemService.save).toHaveBeenCalledWith({
                functionalStatus: FUNCTIONAL_STATUS.AWAITING_REPAIR,
                reasonNotWorkingOrNotInUse: REASON_FOR_NOT_WORKING.NEEDS_SPARE_PARTS,
                yearOfDecommission: undefined
            });
        });

        it('should ignore date for UNSERVICABLE status', function() {
            vm.newStatus = FUNCTIONAL_STATUS.UNSERVICABLE;
            vm.reason = REASON_FOR_NOT_WORKING.NEEDS_SPARE_PARTS;
            vm.yearOfDecommission = 2017;

            vm.save();

            expect(inventoryItemService.save).toHaveBeenCalledWith({
                functionalStatus: FUNCTIONAL_STATUS.UNSERVICABLE,
                reasonNotWorkingOrNotInUse: REASON_FOR_NOT_WORKING.NEEDS_SPARE_PARTS,
                yearOfDecommission: undefined
            });
        });

        it('should pass date and reason for OBSOLETE status', function() {
            vm.newStatus = FUNCTIONAL_STATUS.OBSOLETE;
            vm.reason = REASON_FOR_NOT_WORKING.NEEDS_SPARE_PARTS;
            vm.yearOfDecommission = 2017;

            vm.save();

            expect(inventoryItemService.save).toHaveBeenCalledWith({
                functionalStatus: FUNCTIONAL_STATUS.OBSOLETE,
                reasonNotWorkingOrNotInUse: REASON_FOR_NOT_WORKING.NEEDS_SPARE_PARTS,
                yearOfDecommission: 2017
            });
        });

        it('should redirect to inventory list after successful save', function() {
            vm.newStatus = FUNCTIONAL_STATUS.OBSOLETE;
            vm.reason = REASON_FOR_NOT_WORKING.NEEDS_SPARE_PARTS;
            vm.yearOfDecommission = 2017;

            vm.save();
            expect($state.go).not.toHaveBeenCalled();
            saveDeferred.resolve();
            $rootScope.$apply();

            expect($state.go).toHaveBeenCalledWith('openlmis.cce.inventory');
        });

    });

});