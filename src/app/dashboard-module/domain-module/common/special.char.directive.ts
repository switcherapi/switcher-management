import { Directive, Input, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[special-chars]',
    standalone: false
})
export class SpecialCharacterDirective {

    @Input() allowRegexStr = '^[a-zA-Z0-9_-]*$';
    @Input() autoUpper = false;
    @Input() autoLower = false;
    @Input() autoUnderscore = false;

    constructor(private readonly el: ElementRef) { }

    @HostListener('input', ['$event']) onInput(event) {
        if (this.autoUpper)
            event.target.value = event.target.value.toUpperCase();
        if (this.autoLower)
            event.target.value = event.target.value.toLowerCase();
        if (this.autoUnderscore)
            event.target.value = event.target.value.replace(/\s/g, '_');
    }

    @HostListener('keypress', ['$event']) onKeyPress(event) {
        if (this.autoUnderscore && event.key === ' ')
            return true;
        return new RegExp(this.allowRegexStr).test(event.key);
    }

    @HostListener('paste', ['$event']) blockPaste(event: KeyboardEvent) {
        this.validateFields(event);
    }

    validateFields(event) {
        setTimeout(() => {
            if (this.autoUnderscore)
                this.el.nativeElement.value = this.el.nativeElement.value.replace(/\s/g, '_');
            if (this.autoUpper)
                this.el.nativeElement.value = this.el.nativeElement.value.toUpperCase();
            if (this.autoLower)
                this.el.nativeElement.value = this.el.nativeElement.value.toLowerCase();

            this.el.nativeElement.value =  this.el.nativeElement.value.replace(this.allowRegexStr, '');
            event.preventDefault();
        }, 100);
    }

}