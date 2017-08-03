import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { ComboBoxComponent } from './combo-box/combo-box.component';

@NgModule({
  declarations: [
    AppComponent,
    ComboBoxComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {

}
