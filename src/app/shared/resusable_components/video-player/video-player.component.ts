import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import {VgApiService, VgCoreModule} from '@videogular/ngx-videogular/core';
import {VgControlsModule} from '@videogular/ngx-videogular/controls';
import {VgOverlayPlayModule} from '@videogular/ngx-videogular/overlay-play';
import {VgBufferingModule} from '@videogular/ngx-videogular/buffering';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [ 
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VideoPlayerComponent {
  preload: string = 'auto';
  api: VgApiService = new VgApiService;
  @Input() link!: string;



  onPlayerReady(source: VgApiService) {
    this.api = source;

    this.api.getDefaultMedia().subscriptions.loadedMetadata.subscribe(
      this.autoplay.bind(this)
    )

    this.api.getDefaultMedia().subscriptions.ended.subscribe(
      () => {
          // Set the video to the beginning
          this.api.getDefaultMedia().currentTime = 0;
      }
  );
}


autoplay() {
  this.api.play();
}
}
