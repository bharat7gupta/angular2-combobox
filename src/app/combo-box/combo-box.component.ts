import { Component, OnInit, ElementRef, Input, forwardRef, EventEmitter, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

// combo-box to select from a list of items
@Component({
    selector: 'combo-box',
    templateUrl: './combo-box.component.html',
    styleUrls: [ "./combo-box.component.css" ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ComboBoxComponent),
            multi: true
        }
    ],
    host: {
        '(document:click)': 'onClickOutside($event)'
    }
})
export class ComboBoxComponent implements OnInit, ControlValueAccessor {
    private oldSearchTerm: string; // keeps track of the previous search term
    private _currentVal: any; // the current selected item
    private initialValue: any = {};

    @Input() list: any[]; // the complete list of possible values
    @Input() invalid: boolean; // indicates if the selected data is invalid
    @Input() displayFieldName: string; // the field to be used for display
    @Input() valueFieldName: string; // the field to be used for value comparison
  
    tempCurrent: any; // the highlighted element
    searchTerm: string; // the search text in the text-part of the combobox
    currentList: any[]; // the filtered list of possible values
    showList: boolean; // boolean to determine if the list needs to be shown

    // get index of selected item from the available list. search param will be applicable on list, if any
    private getSelectedIndex(): number {
        for(var i=0; i<this.currentList.length; i++){
            if(this.tempCurrent && this.tempCurrent !== null
                && this.tempCurrent[this.valueFieldName] === this.currentList[i][this.valueFieldName])
                return i;
        }
        return -1;
    }

    // Handles navigation through the list on arrow up or arrow down keys
    private moveCurrentIndex(moveDirection) {
        let currentIndex = this.getSelectedIndex();
        let listSize = this.currentList.length;

        if(currentIndex === -1)
            this.tempCurrent = this.initialValue;
        else{
            if(moveDirection === "down")
                currentIndex = (currentIndex + 1) % listSize;
            else
                currentIndex = currentIndex===0 ? listSize-1 : --currentIndex;

            this.tempCurrent = this.currentList[ currentIndex ];
        }
    }

    constructor(private elementRef: ElementRef) { }

    ngOnInit() {
        if(!this.displayFieldName || this.displayFieldName===null)
            throw "Invalid displayFieldName";

        if(!this.valueFieldName || this.valueFieldName===null)
            throw "Invalid displayFieldName";

        this.currentList = this.list;
        this.initialValue[this.displayFieldName] = "--- Please select ---";
        this.initialValue[this.valueFieldName] = null;
    }

    // Checks if the searchTerm has changed and updates the UI accordingly
    ngDoCheck() {
        if (this.searchTerm !== this.oldSearchTerm) {
            this.refreshList();
            this.oldSearchTerm = this.searchTerm;

            let currentIndex = this.getSelectedIndex();
            if(currentIndex === -1 && this.currentList[0]){
                this.tempCurrent = this.currentList[0];
            }
        }
    }

    // searches by the searchTerm and updates the list
    refreshList() {
        if(this.list && this.list.length>0) {
            let searchBy = this.searchTerm.toLowerCase();
            let tempList = this.list.filter((listItem) => {
                return listItem[this.displayFieldName].toLowerCase().indexOf(searchBy) >= 0;
            });
            tempList.unshift(this.initialValue);
            this.currentList = tempList;
        }
    }

    // saves the item selected by user
    setValue(value) {
        this.showList = false;
        this.tempCurrent = value;
        this.currentVal = value;
        this.searchTerm = value[this.displayFieldName];
    }

    // Toggles show-hide of list on dropdown arrow click
    toggleListDisplay() {
        this.showList = !this.showList;
        this.searchTerm = this.showList ? "" : this.currentVal[this.displayFieldName];
    }

    // Helps in navigation through the list
    navigateList(event) {
        event.preventDefault();
        event.stopPropagation();
        if(event.keyCode === 27) { // Esc key
            this.showList = false;
        }
        else if(event.keyCode === 38) { // arrow up
            this.showList && this.moveCurrentIndex("up");
        }
        else if(event.keyCode === 40) { // arrow down
            if(this.showList)
                this.moveCurrentIndex("down");
            else
                this.searchTerm = "";
        }
        // if not tab, shift or keys
        if([9, 16, 17, 13, 27].indexOf(event.keyCode)===-1){
            this.showList = true;
            this.refreshList();
        }
    }

    // handles tab events
    handleKeyDown(event) {
        if(event.keyCode === 9 || event.keyCode === 13) { // select item on tab or enter key
            this.setValue(this.tempCurrent);
            setTimeout(() => this.showList = false, 200);
        }
    }

    // Hides the list if the user clicks outside of the component
    onClickOutside(event) {
        if (!this.elementRef.nativeElement.contains(event.target)){
            this.searchTerm = this.currentVal[this.displayFieldName];
            this.showList = false;
        }
    }

    // Implementing ControlValueAccessor interface
    propagateChange = (_: any) => {};

    get currentVal() {
        return this._currentVal;
    }

    set currentVal(value) {
        this._currentVal = value;
        this.propagateChange(this.currentVal);
    }

    writeValue(value: any): void {
        if((value && value !== null) || this.currentList.length>0) {
            this.currentVal = (value && value !== null) ? value : this.initialValue;
            this.searchTerm = this.currentVal[this.displayFieldName];
            this.oldSearchTerm = this.searchTerm;
            this.tempCurrent = this.currentVal;
        }
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void { }

    setDisabledState(isDisabled: boolean): void { }
}
