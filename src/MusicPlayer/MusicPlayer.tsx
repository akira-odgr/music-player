import { useEffect, useRef, useState } from "react";
import { musicData } from "./MusicData";
import { FaBackward, FaPlay, FaPause, FaForward } from "react-icons/fa6";

import "./MusicPlayer.scss";

export const MusicPlayer = () => {
    // 現在の曲のインデックスを管理
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    // 再生中かどうかを管理
    const [isPlaying, setIsPlaying] = useState(false);
    // 現在の再生時間を管理（初期値は 0）
    const [currentTime, setCurrentTime] = useState(0);

    // audio 要素の参照を保持
    const audioRef = useRef<HTMLAudioElement>(null);
    // プログレスバーの参照を保持
    const progressBarRef = useRef<HTMLDivElement>(null);

    // 現在の曲の duration を取得（audioRef が存在する場合）
    const duration = audioRef.current?.duration || 0;

    // 曲が変更されたときに再生位置をリセット
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0; // 再生位置を 0 にリセット
            setCurrentTime(0); // currentTimeもリセット
        }
    }, [currentSongIndex]);

    // コンポーネントが最初にマウントされたときに progressBar を 0 に設定
    useEffect(() => {
        setCurrentTime(0); // 初期値を 0 に設定
    }, []);

    // 再生中に進行状況を更新するためのエフェクト
    useEffect(() => {
        // 再生中に定期的に再生時間を更新するためのタイマー
        let interval: ReturnType<typeof setInterval> | null = null; // intervalをnullで初期化

        // 再生中の場合、1秒ごとに再生時間を更新
        if (isPlaying && audioRef.current) {
            interval = setInterval(() => {
                if (audioRef.current) {
                    setCurrentTime(audioRef.current.currentTime); // currentTimeを更新
                }
            }, 1000);
        } else if (interval) {
            clearInterval(interval); // 再生停止時にはintervalをクリア
        }

        // クリーンアップ関数：コンポーネントがアンマウントされる際にintervalをクリア
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isPlaying]);

    // 前の曲に移動する処理
    const handlePrev = () => {
        setCurrentSongIndex(
            (prevIndex) => (prevIndex - 1 + musicData.length) % musicData.length
        );
        setCurrentTime(0); // 曲を変更したときにプログレスバーもリセット
        setIsPlaying(false); // 曲変更時に再生を停止し、FaPlayに戻す
    };

    // 次の曲に移動する処理
    const handleNext = () => {
        setCurrentSongIndex(
            (prevIndex) => (prevIndex + 1 + musicData.length) % musicData.length
        );
        setCurrentTime(0); // 曲を変更したときにプログレスバーもリセット
        setIsPlaying(false); // 曲変更時に再生を停止し、FaPlayに戻す
    };

    // 再生/一時停止を切り替える処理
    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause(); // 再生中の場合、停止
            } else {
                audioRef.current.play(); // 停止中の場合、再生
            }
        }
        setIsPlaying(!isPlaying); // 再生状態を切り替え
    };

    // プログレスバーをクリックして再生位置を変更する処理
    const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current || !progressBarRef.current) {
            return; // audioRefまたはprogressBarRefが存在しない場合は処理しない
        }

        const rect = progressBarRef.current.getBoundingClientRect(); // プログレスバーの位置とサイズを取得
        const clickX = event.clientX - rect.left; // クリック位置のX座標を取得
        const newTime = (clickX / rect.width) * duration; // 新しい再生時間を計算

        // 新しい再生時間が有効な範囲内にある場合、再生位置を変更
        if (!isNaN(newTime) && newTime >= 0 && newTime <= duration) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime); // currentTimeを更新
        }
    };

    return (
        <div className="musicPlayer__container">
            {/* 背景画像 */}
            <div className="player__bg">
                <img
                    src={musicData[currentSongIndex].coverUrl}
                    alt="music-cover"
                />
            </div>

            <div className="player__content">
                {/* 曲のカバー画像 */}
                <div className="player__content__image">
                    <img src={musicData[currentSongIndex].coverUrl} alt="" />
                </div>

                {/* 曲のタイトル */}
                <h2 className="player__content__title">
                    {musicData[currentSongIndex].title}
                </h2>
                {/* 曲のアーティスト名 */}
                <h3 className="player__content__artist">
                    {musicData[currentSongIndex].artist}
                </h3>

                <div className="progress">
                    {/* プログレスバー */}
                    <div
                        className="progress__bar"
                        ref={progressBarRef}
                        onClick={handleProgressClick} // プログレスバーをクリックすると再生位置が変更される
                        style={{
                            position: "relative",
                            height: "10px",
                            backgroundColor: "#ccc",
                            cursor: "pointer",
                            width: "100%",
                        }}
                    >
                        <div
                            className="progress__bar__fill"
                            style={{
                                width: `${(currentTime / duration) * 100}%`, // 現在の再生時間に基づいてプログレスバーの幅を調整
                                background:
                                    "linear-gradient(to right, #ff7e5f, #feb47b)",
                                height: "100%",
                            }}
                        ></div>
                    </div>
                    <div className="progress__duration">
                        {/* 現在の再生時間 */}
                        <span className="current-time">
                            {new Date(currentTime * 1000)
                                .toISOString()
                                .substr(14, 5)}
                        </span>
                        {/* 曲の総再生時間 */}
                        <span className="duration">
                            {new Date(duration * 1000)
                                .toISOString()
                                .substr(14, 5)}
                        </span>
                    </div>
                </div>

                <div className="player__controls">
                    {/* 前の曲に移動するボタン */}
                    <button
                        className="player__controls__icon"
                        onClick={handlePrev}
                    >
                        <FaBackward className="icon" />
                    </button>
                    {/* 再生/一時停止を切り替えるボタン */}
                    <button
                        className="player__controls__icon"
                        onClick={togglePlay}
                    >
                        {isPlaying ? (
                            <FaPause className="icon" />
                        ) : (
                            <FaPlay className="icon" />
                        )}
                    </button>
                    {/* 次の曲に移動するボタン */}
                    <button
                        className="player__controls__icon"
                        onClick={handleNext}
                    >
                        <FaForward className="icon" />
                    </button>
                </div>
            </div>

            {/* 音楽の再生 */}
            <audio
                ref={audioRef}
                src={musicData[currentSongIndex].musicUrl}
                preload="auto"
            />
        </div>
    );
};
