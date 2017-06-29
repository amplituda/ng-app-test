import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { VCLIconModule } from '@ng-vcl/ng-vcl';

import { AppComponent } from './components/app/app.component';
import { HomeComponent } from "./components/home/home.component";

import { routing, appRoutingProviders } from './app.routes';

import { VCLPlotlyModule } from '@ng-vcl/plotly';

@NgModule({
  providers: [
    appRoutingProviders
  ],
  imports: [
    BrowserModule,
    VCLIconModule,
    VCLPlotlyModule,
    routing
  ],
  declarations: [
    AppComponent,
    HomeComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }



